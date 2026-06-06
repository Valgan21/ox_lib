import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useNuiEvent } from '@/nui/useNuiEvent'
import { fetchNui } from '@/nui/nui'
import { locale } from '@/nui/locale'
import type { AlertDialogProps, AlertResult } from '@/types'
import { Icon } from '../Icon'

const SIZE: Record<string, string> = {
  xs: 'w-[300px]',
  sm: 'w-[360px]',
  md: 'w-[420px]',
  lg: 'w-[520px]',
  xl: 'w-[640px]',
}

export function AlertDialog() {
  const [alert, setAlert] = useState<AlertDialogProps | null>(null)
  const visible = alert !== null

  useNuiEvent<AlertDialogProps>('sendAlert', (data) => setAlert(data))
  useNuiEvent('closeAlertDialog', () => setAlert(null))

  const respond = useCallback((result: AlertResult) => {
    setAlert(null)
    fetchNui('closeAlert', result)
  }, [])

  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        respond('cancel')
      } else if (e.key === 'Enter') {
        e.preventDefault()
        respond('confirm')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, respond])

  return (
    <AnimatePresence>
      {alert && <AlertCard key="alert" alert={alert} onRespond={respond} />}
    </AnimatePresence>
  )
}

function AlertCard({ alert, onRespond }: { alert: AlertDialogProps; onRespond: (r: AlertResult) => void }) {
  const centered = !!alert.centered
  const icon = alert.icon ?? 'circle-exclamation'
  const iconColor = alert.iconColor ?? 'var(--rs-accent)'

  const Badge = ({ size }: { size: number }) => (
    <span
      className="grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: 'rgba(245,165,36,0.12)',
        color: iconColor,
        boxShadow: centered
          ? 'inset 0 0 0 0.5px rgba(245,165,36,0.32), var(--shadow-inset-tile), 0 0 26px rgba(245,165,36,0.18)'
          : 'inset 0 0 0 0.5px rgba(245,165,36,0.32), var(--shadow-inset-tile)',
      }}
    >
      <Icon icon={icon} fixedWidth />
    </span>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseDown={(e) => e.target === e.currentTarget && onRespond('cancel')}
      className="fixed inset-0 z-[1100] grid place-items-center bg-black/55 p-6"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        onMouseDown={(e) => e.stopPropagation()}
        className={`flex max-h-[82vh] max-w-[92vw] flex-col overflow-hidden rounded-[18px] border-[0.5px] border-white/10 bg-surface-01 [box-shadow:var(--shadow-float),inset_0_1px_0_rgba(255,255,255,0.05)] ${
          SIZE[alert.size ?? 'md'] ?? SIZE.md
        }`}
      >

        <header
          className={`relative shrink-0 border-b-[0.5px] border-sep px-6 pb-4 pt-5 ${centered ? 'text-center' : ''}`}
        >
          <span className="absolute inset-x-[40%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,165,36,0.55),transparent)]" />

          <button
            type="button"
            onClick={() => onRespond('cancel')}
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/[0.05] text-[13px] text-fg-mute transition-all duration-150 hover:bg-white/[0.1] hover:text-fg active:scale-90"
            aria-label="Close"
          >
            <Icon icon="xmark" fixedWidth />
          </button>

          {centered ? (
            <>
              <div className="mx-auto mb-3 w-fit">
                <Badge size={52} />
              </div>
              <span className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                Alert
              </span>
              <h2 className="mt-1 px-4 text-[19px] font-semibold leading-tight tracking-[var(--tracking-heading)] text-fg">
                {alert.header}
              </h2>
            </>
          ) : (
            <div className="flex items-center gap-3.5 pr-9">
              <Badge size={40} />
              <div className="min-w-0">
                <span className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                  Alert
                </span>
                <h2 className="mt-0.5 text-[18px] font-semibold leading-tight tracking-[var(--tracking-heading)] text-fg">
                  {alert.header}
                </h2>
              </div>
            </div>
          )}
        </header>

        <div className="sb-scroll min-h-0 flex-1 px-6 py-5">
          <div className={`alert-md ${centered ? 'centered' : ''}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{alert.content}</ReactMarkdown>
          </div>
        </div>

        {centered ? (
          <footer className="flex shrink-0 items-center justify-center gap-2.5 border-t-[0.5px] border-sep bg-[rgba(0,0,0,0.18)] px-6 py-4">
            {alert.cancel && <CancelBtn label={alert.labels?.cancel} onClick={() => onRespond('cancel')} />}
            <ConfirmBtn label={alert.labels?.confirm} onClick={() => onRespond('confirm')} />
          </footer>
        ) : (
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2.5 border-t-[0.5px] border-sep bg-[rgba(0,0,0,0.18)] px-6 py-4">
            <div className="flex items-center gap-3">
              <Hint kbd="↵" label="Confirm" />
              <Hint kbd="Esc" label="Cancel" />
            </div>
            <div className="ml-auto flex items-center gap-2.5">
              {alert.cancel && <CancelBtn label={alert.labels?.cancel} onClick={() => onRespond('cancel')} />}
              <ConfirmBtn label={alert.labels?.confirm} onClick={() => onRespond('confirm')} />
            </div>
          </footer>
        )}
      </motion.div>
    </motion.div>
  )
}

function ConfirmBtn({ label, onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-pill bg-gradient-to-b from-accent-hi to-accent px-6 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-[#0b0705] transition-all duration-150 [box-shadow:var(--shadow-cta)] hover:[box-shadow:0_8px_32px_rgba(245,165,36,0.55)] active:scale-[0.96]"
    >
      {label ?? locale('ui.confirm', 'Confirm')}
    </button>
  )
}

function CancelBtn({ label, onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-pill border-[0.5px] border-white/10 bg-surface-02 px-5 py-2.5 text-[14px] font-medium text-fg-soft transition-all duration-150 hover:bg-surface-03 hover:text-fg active:scale-[0.97]"
    >
      {label ?? locale('ui.cancel', 'Cancel')}
    </button>
  )
}

function Hint({ kbd, label }: { kbd: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <kbd className="grid h-[18px] min-w-[18px] place-items-center rounded-[5px] border-[0.5px] border-white/[0.12] bg-gradient-to-b from-surface-02 to-surface-01 px-1 font-mono text-[9px] leading-none text-fg-soft [box-shadow:inset_0_1px_0_rgba(255,255,255,0.09),0_1px_2px_rgba(0,0,0,0.45)]">
        {kbd}
      </kbd>
      <span className="font-display text-[8.5px] font-semibold uppercase tracking-[0.16em] text-fg-mute">{label}</span>
    </span>
  )
}
