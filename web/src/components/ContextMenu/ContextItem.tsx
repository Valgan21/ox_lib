import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ContextMenuItem } from '@/types'
import { Icon } from '../Icon'

interface Props {
  item: ContextMenuItem
  index: number
  focused: boolean
  onHover: () => void
  onSelect: () => void
}

type MetaRow = { label: string; value?: string | number; progress?: number }

function toMetaRows(metadata: ContextMenuItem['metadata']): MetaRow[] {
  if (!metadata) return []
  if (typeof metadata === 'string') return [{ label: metadata }]
  if (Array.isArray(metadata))
    return metadata.map((m) => (typeof m === 'string' ? { label: m } : (m as MetaRow)))
  return Object.entries(metadata).map(([label, value]) => ({ label, value }))
}

const SCHEME: Record<string, string> = {
  red: 'var(--rs-danger)',
  green: 'var(--rs-success)',
  teal: 'var(--rs-success)',
  blue: 'var(--rs-info)',
  cyan: 'var(--rs-info)',
  yellow: 'var(--rs-accent)',
  orange: 'var(--rs-accent)',
}

const itemVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
}

export function ContextItem({ item, index, focused, onHover, onSelect }: Props) {
  const [hover, setHover] = useState(false)
  const interactive = !item.disabled && !item.readOnly
  const showArrow = !!item.menu || !!item.arrow
  const meta = toMetaRows(item.metadata)
  const hasProgress = typeof item.progress === 'number'
  const multiline = !!item.description || hasProgress
  const progColor = item.colorScheme ? SCHEME[item.colorScheme] ?? 'var(--rs-accent)' : null
  const isFocused = focused && interactive

  return (
    <motion.div
      data-cindex={index}
      variants={itemVariants}
      className="relative border-b-[0.5px] border-sep last:border-b-0"
      onMouseEnter={() => {
        onHover()
        if (meta.length > 0) setHover(true)
      }}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        disabled={item.disabled}
        onClick={onSelect}
        className={[
          'group relative flex w-full gap-3 px-3.5 py-2.5 text-left transition-colors duration-150',
          multiline ? 'items-start' : 'items-center',
          item.disabled
            ? 'cursor-not-allowed opacity-40'
            : !interactive
              ? 'cursor-default'
              : isFocused
                ? 'cursor-pointer bg-accent-soft'
                : 'cursor-pointer hover:bg-white/[0.03]',
        ].join(' ')}
      >

        {isFocused && (
          <span className="absolute inset-y-0 left-0 w-[2px] bg-accent [box-shadow:0_0_10px_var(--rs-accent)]" />
        )}

        {item.image ? (
          <img src={item.image} alt="" className="h-8 w-8 shrink-0 rounded-[9px] object-cover [box-shadow:var(--shadow-inset-tile)]" />
        ) : (
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] text-[12.5px] [background:var(--tint-slate)] [box-shadow:var(--shadow-inset-tile)]"
            style={{ color: item.iconColor ?? 'rgba(255,255,255,0.82)' }}
          >
            {item.icon ? <Icon icon={item.icon} fixedWidth /> : <span className="h-1 w-1 rounded-full bg-white/25" />}
          </span>
        )}

        <div className="min-w-0 flex-1">
          {item.title && (
            <p className="truncate text-[13px] font-medium tracking-[-0.005em] text-fg">{item.title}</p>
          )}
          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-[1.4] text-fg-mute">{item.description}</p>
          )}
          {hasProgress && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-[3px] flex-1 overflow-hidden rounded-pill bg-white/[0.08]">
                <div
                  className="h-full rounded-pill transition-[width] duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, item.progress as number))}%`,
                    background: progColor ?? 'linear-gradient(90deg, var(--rs-accent), var(--rs-accent-hi))',
                  }}
                />
              </div>
              <span className="font-mono text-[9.5px] text-fg-mute">{Math.round(item.progress as number)}%</span>
            </div>
          )}
        </div>

        {showArrow && (
          <span
            className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[10px] transition-all duration-150 ${
              multiline ? 'mt-0.5' : ''
            } ${
              isFocused
                ? 'translate-x-0.5 bg-accent/15 text-accent'
                : 'text-fg-mute group-hover:translate-x-0.5 group-hover:bg-white/[0.07] group-hover:text-fg-soft'
            }`}
          >
            <Icon icon="chevron-right" fixedWidth />
          </span>
        )}
      </button>

      <AnimatePresence>
        {hover && meta.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="sb-scroll absolute right-full top-0 z-[10] mr-2.5 max-h-[260px] w-[212px] rounded-[13px] border-[0.5px] border-white/10 bg-surface-01 p-3 [box-shadow:var(--shadow-float)]"
          >
            <span className="mb-2 block font-display text-[8.5px] font-semibold uppercase tracking-[0.24em] text-fg-mute">
              Details
            </span>
            <div className="flex flex-col gap-2">
              {meta.map((m, i) => (
                <div key={i} className="text-[11.5px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-fg-soft">{m.label}</span>
                    {m.value != null && <span className="font-mono text-[11px] text-fg">{m.value}</span>}
                  </div>
                  {typeof m.progress === 'number' && (
                    <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-pill bg-white/[0.08]">
                      <div
                        className="h-full rounded-pill bg-gradient-to-r from-accent to-accent-hi"
                        style={{ width: `${Math.min(100, Math.max(0, m.progress))}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
