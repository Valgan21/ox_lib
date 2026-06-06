import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { NotificationPosition, NotificationProps, NotificationType } from '@/types'
import { Icon } from '../Icon'

interface Props {
  notification: NotificationProps
  position: NotificationPosition
  restartKey: number
  onDismiss: () => void
}

const TYPE: Record<NotificationType, { color: string; rgb: string; label: string; icon: string }> = {
  info: { color: 'var(--rs-info)', rgb: '71,159,250', label: 'Notice', icon: 'circle-info' },
  success: { color: 'var(--rs-success)', rgb: '52,199,123', label: 'Success', icon: 'circle-check' },
  warning: { color: 'var(--rs-accent)', rgb: '245,165,36', label: 'Alert', icon: 'triangle-exclamation' },
  error: { color: 'var(--rs-danger)', rgb: '255,69,58', label: 'Error', icon: 'circle-exclamation' },
}

const RING_R = 15
const RING_C = 2 * Math.PI * RING_R

function clockNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function NotificationCard({ notification, restartKey, onDismiss }: Props) {
  // Fall back to 'info' for any type not in the map ('inform', custom values, …)
  // so an unknown type never crashes on t.color.
  const t = TYPE[notification.type as NotificationType] ?? TYPE.info
  const duration = notification.duration ?? 3000
  const iconColor = notification.iconColor ?? t.color
  const showRing = !!notification.showDuration && duration > 0

  const [progress, setProgress] = useState(100)
  const [time, setTime] = useState(clockNow)

  const start = useRef(0)
  const pausedAt = useRef<number | null>(null)

  const pause = () => {
    if (pausedAt.current == null) pausedAt.current = performance.now()
  }
  const resume = () => {
    if (pausedAt.current != null) {
      start.current += performance.now() - pausedAt.current
      pausedAt.current = null
    }
  }

  useEffect(() => {
    setTime(clockNow())
    if (duration <= 0) return
    setProgress(100)
    start.current = performance.now()
    pausedAt.current = null
    let raf = 0

    const tick = (now: number) => {
      if (pausedAt.current != null) {
        raf = requestAnimationFrame(tick)
        return
      }
      const elapsed = now - start.current
      const pct = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(pct)
      if (elapsed >= duration) return onDismiss()
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [duration, restartKey, onDismiss])

  return (
    <motion.div
      onMouseEnter={pause}
      onMouseLeave={resume}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.16 } }}
      transition={{ type: 'spring', stiffness: 460, damping: 34 }}
      className="group pointer-events-auto relative w-full overflow-hidden rounded-[14px] border-[0.5px] border-white/[0.09] bg-panel px-3 py-2.5 [box-shadow:var(--shadow-raised),inset_0_1px_0_rgba(255,255,255,0.06)]"
      style={{
        backgroundImage: `radial-gradient(130% 120% at 0% 0%, rgba(${t.rgb},0.1) 0%, transparent 46%)`,
        ...notification.style,
      }}
    >

      <span
        className="absolute inset-x-[16%] top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${t.rgb},0.5), transparent)` }}
      />

      <div className="flex items-center gap-2.5">

        <div className="relative grid h-[34px] w-[34px] shrink-0 place-items-center self-start">
          {showRing && (
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r={RING_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              <circle
                cx="17"
                cy="17"
                r={RING_R}
                fill="none"
                stroke={t.color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - progress / 100)}
                style={{ filter: `drop-shadow(0 0 3px rgba(${t.rgb},0.7))` }}
              />
            </svg>
          )}
          <span
            className="grid h-[26px] w-[26px] place-items-center rounded-full text-[12px]"
            style={{
              background: `rgba(${t.rgb},0.14)`,
              boxShadow: `inset 0 0 0 0.5px rgba(${t.rgb},0.36), var(--shadow-inset-tile)`,
            }}
          >
            <Icon icon={notification.icon ?? t.icon} color={iconColor} animation={notification.iconAnimation} fixedWidth />
          </span>
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-1.5">
            <span
              className="h-1 w-1 shrink-0 rounded-full [animation:pulse-dot_1.8s_ease-in-out_infinite]"
              style={{ background: t.color, boxShadow: `0 0 5px rgba(${t.rgb},0.8)` }}
            />
            <span
              className="font-display text-[8.5px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: t.color }}
            >
              {t.label}
            </span>

            <span className="relative ml-auto h-3.5">
              <span className="font-mono text-[9.5px] text-fg-mute transition-opacity duration-150 group-hover:opacity-0">
                {time}
              </span>
              <button
                onClick={onDismiss}
                className="absolute -right-1 -top-1 grid h-[18px] w-[18px] place-items-center rounded-full text-[9px] text-fg-mute opacity-0 transition-all duration-150 hover:bg-white/10 hover:text-fg group-hover:opacity-100 active:scale-90"
                aria-label="Dismiss"
              >
                <Icon icon="xmark" fixedWidth />
              </button>
            </span>
          </div>

          {notification.title && (
            <p className="mt-0.5 truncate text-[12.5px] font-semibold leading-tight tracking-[-0.01em] text-fg">
              {notification.title}
            </p>
          )}
          {notification.description && (
            <p
              className={`whitespace-pre-line break-words text-[11.5px] leading-[1.4] text-fg-soft ${
                notification.title ? 'mt-0.5' : 'mt-1'
              }`}
            >
              {notification.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
