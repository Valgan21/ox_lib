import { useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useNuiEvent } from '@/nui/useNuiEvent'
import type { NotificationPosition, NotificationProps } from '@/types'
import { NotificationCard } from './NotificationCard'

interface Active {
  uid: number
  seq: number
  oxId?: string | number
  data: NotificationProps
}

const POSITIONS: NotificationPosition[] = [
  'top-left',
  'top',
  'top-right',
  'center-left',
  'center-right',
  'bottom-left',
  'bottom',
  'bottom-right',
]

const ANCHOR: Record<NotificationPosition, string> = {
  'top-left': 'top-0 left-0 items-start flex-col-reverse',
  top: 'top-0 left-1/2 -translate-x-1/2 items-center flex-col-reverse',
  'top-right': 'top-0 right-0 items-end flex-col-reverse',
  'center-left': 'top-1/2 left-0 -translate-y-1/2 items-start flex-col',
  'center-right': 'top-1/2 right-0 -translate-y-1/2 items-end flex-col',
  'bottom-left': 'bottom-0 left-0 items-start flex-col',
  bottom: 'bottom-0 left-1/2 -translate-x-1/2 items-center flex-col',
  'bottom-right': 'bottom-0 right-0 items-end flex-col',
}

const MAX_VISIBLE = 6

// Normalise any unknown/invalid position to top-right so a toast is never
// silently dropped for using a position outside the supported set.
const posOf = (d: NotificationProps): NotificationPosition =>
  POSITIONS.includes(d.position as NotificationPosition) ? (d.position as NotificationPosition) : 'top-right'

let counter = 0

export function Notifications() {
  const [items, setItems] = useState<Active[]>([])

  const dismiss = useCallback((uid: number) => {
    setItems((prev) => prev.filter((n) => n.uid !== uid))
  }, [])

  useNuiEvent<NotificationProps>('notify', (data) => {
    setItems((prev) => {
      if (data.id != null) {
        const idx = prev.findIndex((n) => n.oxId === data.id)
        if (idx !== -1) {
          const next = [...prev]
          next[idx] = { ...next[idx], seq: next[idx].seq + 1, data }
          return next
        }
      }

      const entry: Active = { uid: ++counter, seq: 0, oxId: data.id, data }
      const next = [...prev, entry]

      const pos = posOf(data)
      const samePos = next.filter((n) => posOf(n.data) === pos)
      if (samePos.length > MAX_VISIBLE) {
        const drop = samePos[0].uid
        return next.filter((n) => n.uid !== drop)
      }
      return next
    })
  })

  return (
    <>
      {POSITIONS.map((pos) => {
        const group = items.filter((n) => posOf(n.data) === pos)

        return (
          <div
            key={pos}
            className={`pointer-events-none fixed z-[9999] flex w-[312px] max-w-[90vw] gap-2 p-3.5 ${ANCHOR[pos]}`}
          >
            <AnimatePresence mode="popLayout">
              {group.map((n) => (
                <NotificationCard
                  key={n.uid}
                  restartKey={n.seq}
                  notification={n.data}
                  position={pos}
                  onDismiss={() => dismiss(n.uid)}
                />
              ))}
            </AnimatePresence>
          </div>
        )
      })}
    </>
  )
}
