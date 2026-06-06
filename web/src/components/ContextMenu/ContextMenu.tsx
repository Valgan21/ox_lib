import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNuiEvent } from '@/nui/useNuiEvent'
import { fetchNui } from '@/nui/nui'
import type { ContextMenuItem, ContextMenuProps } from '@/types'
import { Icon } from '../Icon'
import { ContextItem } from './ContextItem'

type Entry = [key: string, item: ContextMenuItem]

function toEntries(options: ContextMenuProps['options']): Entry[] {
  if (Array.isArray(options)) return options.map((item, i) => [String(i), item])
  return Object.entries(options)
}

const selectable = (item: ContextMenuItem) => !item.disabled && !item.readOnly

const listVariants = {
  show: { transition: { staggerChildren: 0.026, delayChildren: 0.05 } },
}

export function ContextMenu() {
  const [menu, setMenu] = useState<ContextMenuProps | null>(null)
  const [navKey, setNavKey] = useState(0)
  const [focus, setFocus] = useState(-1)
  const listRef = useRef<HTMLDivElement>(null)
  const visible = menu !== null

  useNuiEvent<ContextMenuProps>('showContext', (data) => {
    setMenu(data)
    setNavKey((k) => k + 1)
  })
  useNuiEvent('hideContext', () => setMenu(null))

  const entries = useMemo(() => (menu ? toEntries(menu.options) : []), [menu])

  const navigable = useMemo(
    () => entries.flatMap(([, item], i) => (selectable(item) ? [i] : [])),
    [entries],
  )

  const close = useCallback(() => {
    if (menu && menu.canClose === false) return
    setMenu(null)
    fetchNui('closeContext')
  }, [menu])

  const openSubmenu = useCallback((id: string, back = false) => {
    fetchNui('openContext', { id, back })
  }, [])

  const select = useCallback(
    (key: string, item: ContextMenuItem) => {
      if (!selectable(item)) return
      if (item.menu) return openSubmenu(item.menu)
      fetchNui('clickContext', key)
    },
    [openSubmenu],
  )

  const moveFocus = useCallback(
    (dir: 1 | -1) => {
      setFocus((cur) => {
        if (navigable.length === 0) return -1
        const pos = navigable.indexOf(cur)
        if (pos === -1) return navigable[dir === 1 ? 0 : navigable.length - 1]
        return navigable[(pos + dir + navigable.length) % navigable.length]
      })
    },
    [navigable],
  )

  useEffect(() => {
    setFocus(navigable[0] ?? -1)
  }, [navKey, navigable])

  useEffect(() => {
    if (focus < 0) return
    listRef.current
      ?.querySelector<HTMLElement>(`[data-cindex="${focus}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [focus])

  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          close()
          break
        case 'Backspace':
          if (menu?.menu) {
            e.preventDefault()
            openSubmenu(menu.menu, true)
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          moveFocus(1)
          break
        case 'ArrowUp':
          e.preventDefault()
          moveFocus(-1)
          break
        case 'Enter': {
          e.preventDefault()
          const entry = entries[focus]
          if (entry) select(entry[0], entry[1])
          break
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, menu, entries, focus, moveFocus, close, openSubmenu, select])

  return (
    <AnimatePresence>
      {menu && (
        <motion.div
          key="ctx"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-[3vw] top-1/2 z-[500] flex max-h-[82vh] w-[332px] -translate-y-1/2 flex-col overflow-hidden rounded-[18px] border-[0.5px] border-white/10 bg-panel [box-shadow:var(--shadow-float),inset_0_1px_0_rgba(255,255,255,0.07)]"
        >

          <header className="relative flex items-center gap-2.5 border-b-[0.5px] border-sep bg-panel-hi px-3.5 py-3">
            <span className="absolute inset-x-[22%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,165,36,0.5),transparent)]" />

            {menu.menu && (
              <button
                onClick={() => openSubmenu(menu.menu as string, true)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.05] text-[13px] text-fg-soft transition-all duration-150 hover:bg-white/[0.1] hover:text-fg active:scale-90"
                aria-label="Back"
              >
                <Icon icon="chevron-left" fixedWidth />
              </button>
            )}

            <div className="min-w-0 flex-1">
              <span className="font-display text-[8.5px] font-semibold uppercase tracking-[0.26em] text-fg-mute">
                {menu.menu ? 'Submenu' : 'Menu'} · {entries.length} {entries.length === 1 ? 'option' : 'options'}
              </span>
              <h2 className="truncate text-[15px] font-semibold leading-tight tracking-[-0.02em] text-fg">
                {menu.title}
              </h2>
            </div>

            {menu.canClose !== false && (
              <button
                onClick={close}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.05] text-[13px] text-fg-mute transition-all duration-150 hover:bg-white/[0.1] hover:text-fg active:scale-90"
                aria-label="Close"
              >
                <Icon icon="xmark" fixedWidth />
              </button>
            )}
          </header>

          <div className="relative min-h-0 flex-1">
            <motion.div
              key={navKey}
              ref={listRef}
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="sb-scroll flex h-full flex-col"
            >
              {entries.length > 0 ? (
                entries.map(([key, item], i) => (
                  <ContextItem
                    key={key}
                    index={i}
                    item={item}
                    focused={focus === i}
                    onHover={() => selectable(item) && setFocus(i)}
                    onSelect={() => select(key, item)}
                  />
                ))
              ) : (
                <div className="grid flex-1 place-items-center px-4 py-10 text-center">
                  <div>
                    <Icon icon="inbox" className="text-[22px] text-fg-mute" />
                    <p className="mt-2.5 text-[12px] text-fg-mute">No options available</p>
                  </div>
                </div>
              )}
            </motion.div>

            <span className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-[rgba(13,13,14,0.92)] to-transparent" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-[rgba(13,13,14,0.92)] to-transparent" />
          </div>

          <footer className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 border-t-[0.5px] border-sep bg-panel-hi px-3 py-2.5">
            <Guide label="Move">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
            </Guide>
            <Guide label="Select">
              <Kbd>↵</Kbd>
            </Guide>
            {menu.menu && (
              <Guide label="Back">
                <Kbd>⌫</Kbd>
              </Guide>
            )}
            {menu.canClose !== false && (
              <Guide label="Close">
                <Kbd>Esc</Kbd>
              </Guide>
            )}
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Guide({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex gap-0.5">{children}</span>
      <span className="font-display text-[8.5px] font-semibold uppercase tracking-[0.16em] text-fg-mute">
        {label}
      </span>
    </span>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="grid h-[18px] min-w-[18px] place-items-center rounded-[5px] border-[0.5px] border-white/[0.12] bg-gradient-to-b from-surface-02 to-surface-01 px-1 font-mono text-[9px] leading-none text-fg-soft [box-shadow:inset_0_1px_0_rgba(255,255,255,0.09),0_1px_2px_rgba(0,0,0,0.45)]">
      {children}
    </kbd>
  )
}
