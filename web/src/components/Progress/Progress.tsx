import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNuiEvent } from '@/nui/useNuiEvent'
import { fetchNui } from '@/nui/nui'

interface ProgressState {
  type: 'bar' | 'circle'
  label?: string
  duration: number
  position?: 'middle' | 'bottom'
}

const RING_R = 38
const RING_C = 2 * Math.PI * RING_R

export function Progress() {
  const [state, setState] = useState<ProgressState | null>(null)
  const [pct, setPct] = useState(0)
  const [circleBottom, setCircleBottom] = useState(false)
  const cancelled = useRef(false)

  useNuiEvent<Omit<ProgressState, 'type'>>('progress', (d) => setState({ type: 'bar', ...d }))
  useNuiEvent<Omit<ProgressState, 'type'>>('circleProgress', (d) => {
    setCircleBottom(d.position === 'bottom')
    setState({ type: 'circle', ...d })
  })
  useNuiEvent('progressCancel', () => {
    cancelled.current = true
    setState(null)
  })

  useEffect(() => {
    if (!state) return
    cancelled.current = false
    setPct(0)
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const p = Math.min(100, ((now - start) / state.duration) * 100)
      setPct(p)
      if (p >= 100) {
        if (!cancelled.current) fetchNui('progressComplete')
        setState(null)
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [state])

  return (
    <>

      <div className="pointer-events-none fixed inset-x-0 bottom-[13vh] z-[800] flex justify-center px-4">
        <AnimatePresence>
          {state?.type === 'bar' && (
            <motion.div
              key="bar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="w-[340px] max-w-full overflow-hidden rounded-[14px] border-[0.5px] border-white/10 bg-panel px-4 py-3 [box-shadow:var(--shadow-float),inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              <span className="absolute inset-x-[30%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,165,36,0.5),transparent)]" />
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1 w-1 shrink-0 rounded-full bg-accent [animation:pulse-dot_1.6s_ease-in-out_infinite] [box-shadow:0_0_6px_rgba(245,165,36,0.8)]" />
                <span className="truncate font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
                  {state.label}
                </span>
                <span className="ml-auto shrink-0 font-mono text-[12px] tabular-nums text-accent">
                  {Math.round(pct)}%
                </span>
              </div>
              <div className="h-[6px] w-full overflow-hidden rounded-pill bg-white/[0.08] [box-shadow:inset_0_1px_2px_rgba(0,0,0,0.4)]">
                <div
                  className="h-full rounded-pill bg-gradient-to-r from-accent to-accent-hi"
                  style={{ width: `${pct}%`, boxShadow: '0 0 10px rgba(245,165,36,0.6)' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className={`pointer-events-none fixed inset-0 z-[800] flex justify-center ${
          circleBottom ? 'items-end pb-[13vh]' : 'items-center'
        }`}
      >
        <AnimatePresence>
          {state?.type === 'circle' && (
            <motion.div
              key="circle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="flex flex-col items-center gap-3"
            >

              <div className="relative grid h-[96px] w-[96px] place-items-center [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.6))]">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 92 92">
                  <circle cx="46" cy="46" r={RING_R} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="5" />
                  <circle
                    cx="46"
                    cy="46"
                    r={RING_R}
                    fill="none"
                    stroke="var(--rs-accent)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={RING_C}
                    strokeDashoffset={RING_C * (1 - pct / 100)}
                    style={{ filter: 'drop-shadow(0 0 6px rgba(245,165,36,0.7))' }}
                  />
                </svg>
                <span className="font-mono text-[22px] font-medium tabular-nums tracking-[-0.02em] text-fg [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
                  {Math.round(pct)}
                  <span className="text-[12px] text-fg-mute">%</span>
                </span>
              </div>
              {state.label && (
                <span className="max-w-[220px] truncate text-center font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-fg [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
                  {state.label}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
