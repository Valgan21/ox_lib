import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNuiEvent } from '@/nui/useNuiEvent'
import { fetchNui } from '@/nui/nui'
import { useT } from '@/nui/locale'
import type { InputDialogProps, InputDialogRow } from '@/types'
import { Icon } from '../Icon'
import { DialogRow } from './DialogRow'

const SIZE: Record<string, string> = {
  xs: 'w-[320px]',
  sm: 'w-[372px]',
  md: 'w-[440px]',
  lg: 'w-[540px]',
  xl: 'w-[660px]',
}

function seed(rows: InputDialogRow[]): unknown[] {
  return rows.map((row) => {
    switch (row.type) {
      case 'checkbox':
        return row.checked ?? false
      case 'multi-select':
        return row.default != null ? [String(row.default)] : []
      case 'number':
      case 'slider':
        return row.default != null ? Number(row.default) : row.min ?? 0
      default:
        return row.default != null ? row.default : ''
    }
  })
}

export function rowError(row: InputDialogRow, value: unknown): string | null {
  if (row.type === 'checkbox') return row.required && value !== true ? 'Required' : null

  const empty = value === '' || value == null || (Array.isArray(value) && value.length === 0)
  if (empty) return row.required ? 'Required' : null

  if ((row.type === 'input' || row.type === 'textarea') && typeof value === 'string') {
    if (row.minLength && value.length < row.minLength) return `Minimum ${row.minLength} characters`
  }
  if (row.type === 'number' && typeof value === 'number') {
    if (row.min != null && value < row.min) return `Minimum ${row.min}`
    if (row.max != null && value > row.max) return `Maximum ${row.max}`
  }
  return null
}

const pad = (n: number) => String(n).padStart(2, '0')

function formatDate(d: Date, fmt: string): string {
  const map: Record<string, string> = {
    YYYY: String(d.getFullYear()),
    MM: pad(d.getMonth() + 1),
    DD: pad(d.getDate()),
    HH: pad(d.getHours()),
    mm: pad(d.getMinutes()),
    ss: pad(d.getSeconds()),
  }
  return fmt.replace(/YYYY|MM|DD|HH|mm|ss/g, (t) => map[t] ?? t)
}

function parseISODate(s: string): Date | null {
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function serialize(row: InputDialogRow, value: unknown): unknown {
  if (value === '' || value == null) return value

  if (row.type === 'date' && typeof value === 'string') {
    const d = parseISODate(value)
    if (!d) return value
    return row.returnString ? (row.format ? formatDate(d, row.format) : value) : d.getTime()
  }

  if (row.type === 'time' && typeof value === 'string') {
    if (row.returnString && row.format) {
      const [h, m] = value.split(':').map(Number)
      const d = new Date()
      d.setHours(h || 0, m || 0, 0, 0)
      return formatDate(d, row.format)
    }
    return value
  }

  if (row.type === 'date-range' && typeof value === 'string') {
    const conv = (s: string) => {
      if (!s) return null
      const d = parseISODate(s)
      if (!d) return s
      return row.returnString ? (row.format ? formatDate(d, row.format) : s) : d.getTime()
    }
    const [from, to] = value.split('|')
    return [conv(from), conv(to)]
  }

  return value
}

export function InputDialog() {
  const [dialog, setDialog] = useState<InputDialogProps | null>(null)
  const [values, setValues] = useState<unknown[]>([])
  const [attempted, setAttempted] = useState(false)
  const [shake, setShake] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const visible = dialog !== null
  const t = useT()

  useNuiEvent<InputDialogProps>('openDialog', (data) => {
    setDialog(data)
    setValues(seed(data.rows))
    setAttempted(false)
  })
  useNuiEvent('closeInputDialog', () => setDialog(null))

  const allowCancel = dialog?.options?.allowCancel !== false

  const cancel = useCallback(() => {
    if (!allowCancel) return
    setDialog(null)
    fetchNui('inputData', null)
  }, [allowCancel])

  const setValue = useCallback((index: number, value: unknown) => {
    setValues((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }, [])

  const errors = useMemo(
    () => (dialog ? dialog.rows.map((row, i) => rowError(row, values[i])) : []),
    [dialog, values],
  )
  const valid = errors.every((e) => e === null)

  const submit = useCallback(() => {
    if (!dialog) return
    if (!valid) {
      setAttempted(true)
      setShake(true)
      window.setTimeout(() => setShake(false), 420)
      return
    }
    setDialog(null)
    fetchNui('inputData', dialog.rows.map((row, i) => serialize(row, values[i])))
  }, [dialog, valid, values])

  useEffect(() => {
    if (!dialog) return
    const raf = requestAnimationFrame(() => {
      formRef.current
        ?.querySelector<HTMLElement>('input:not([type="color"]), textarea, select')
        ?.focus()
    })
    return () => cancelAnimationFrame(raf)
  }, [dialog])

  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, cancel])

  return (
    <AnimatePresence>
      {dialog && (
        <motion.div
          key="dialog-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => e.target === e.currentTarget && cancel()}
          className="fixed inset-0 z-[1000] grid place-items-center bg-black/55 p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`flex max-h-[86vh] max-w-[92vw] flex-col overflow-hidden rounded-[18px] border-[0.5px] border-white/10 bg-surface-01 [box-shadow:var(--shadow-float),inset_0_1px_0_rgba(255,255,255,0.05)] ${
              SIZE[dialog.options?.size ?? 'md'] ?? SIZE.md
            }`}
          >
            <div className={`flex min-h-0 flex-1 flex-col ${shake ? 'animate-shake' : ''}`}>

              <header className="relative shrink-0 border-b-[0.5px] border-sep px-6 pb-4 pt-5">
                <span className="absolute inset-x-[40%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,165,36,0.55),transparent)]" />
                <span className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                  Form
                </span>
                <h2 className="mt-1 pr-9 text-[19px] font-semibold leading-tight tracking-[var(--tracking-heading)] text-fg">
                  {dialog.heading}
                </h2>
                {allowCancel && (
                  <button
                    type="button"
                    onClick={cancel}
                    className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/[0.05] text-[13px] text-fg-mute transition-all duration-150 hover:bg-white/[0.1] hover:text-fg active:scale-90"
                    aria-label="Close"
                  >
                    <Icon icon="xmark" fixedWidth />
                  </button>
                )}
              </header>

              <form
                ref={formRef}
                onSubmit={(e) => {
                  e.preventDefault()
                  submit()
                }}
                className="flex min-h-0 flex-1 flex-col"
              >

                <div className="relative flex min-h-0 flex-1 flex-col">
                  <div className="sb-scroll flex min-h-0 flex-1 flex-col gap-5 px-6 py-5">
                    {dialog.rows.map((row, i) => (
                      <DialogRow
                        key={i}
                        row={row}
                        value={values[i]}
                        onChange={(v) => setValue(i, v)}
                        error={errors[i]}
                        showError={attempted}
                      />
                    ))}
                  </div>
                  <span className="pointer-events-none absolute inset-x-0 top-0 z-10 h-3.5 bg-gradient-to-b from-surface-01 to-transparent" />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-3.5 bg-gradient-to-t from-surface-01 to-transparent" />
                </div>

                <footer className="flex shrink-0 items-center justify-between gap-3 border-t-[0.5px] border-sep bg-[rgba(0,0,0,0.18)] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Hint kbd="↵" label="Confirm" />
                    {allowCancel && <Hint kbd="Esc" label="Cancel" />}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {allowCancel && (
                      <button
                        type="button"
                        onClick={cancel}
                        className="inline-flex items-center justify-center rounded-pill border-[0.5px] border-white/10 bg-surface-02 px-5 py-2.5 text-[14px] font-medium text-fg-soft transition-all duration-150 hover:bg-surface-03 hover:text-fg active:scale-[0.97]"
                      >
                        {t('ui.cancel', 'Cancel')}
                      </button>
                    )}
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-pill bg-gradient-to-b from-accent-hi to-accent px-6 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-[#0b0705] transition-all duration-150 [box-shadow:var(--shadow-cta)] hover:[box-shadow:0_8px_32px_rgba(245,165,36,0.55)] active:scale-[0.96]"
                    >
                      <Icon icon="check" fixedWidth />
                      {t('ui.confirm', 'Confirm')}
                    </button>
                  </div>
                </footer>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Hint({ kbd, label }: { kbd: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <kbd className="grid h-[18px] min-w-[18px] place-items-center rounded-[5px] border-[0.5px] border-white/[0.12] bg-gradient-to-b from-surface-02 to-surface-01 px-1 font-mono text-[9px] leading-none text-fg-soft [box-shadow:inset_0_1px_0_rgba(255,255,255,0.09),0_1px_2px_rgba(0,0,0,0.45)]">
        {kbd}
      </kbd>
      <span className="font-display text-[8.5px] font-semibold uppercase tracking-[0.16em] text-fg-mute">
        {label}
      </span>
    </span>
  )
}
