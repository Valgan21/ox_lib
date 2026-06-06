import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNuiEvent } from '@/nui/useNuiEvent'
import { fetchNui } from '@/nui/nui'
import type { IconValue } from '@/types'
import { Icon } from '../Icon'

type MenuValue = string | { label: string; description?: string }

interface MenuItem {
  label: string
  progress?: number
  colorScheme?: string
  icon?: IconValue
  iconColor?: string
  values?: MenuValue[]
  checked?: boolean
  description?: string
  defaultIndex?: number
  close?: boolean
}

type MenuPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

interface MenuData {
  position?: MenuPosition
  canClose?: boolean
  title: string
  items: MenuItem[]
  startItemIndex?: number
  disableInput?: boolean
}

const ANCHOR: Record<MenuPosition, string> = {
  'top-left': 'items-start justify-start',
  'top-right': 'items-start justify-end',
  'bottom-left': 'items-end justify-start',
  'bottom-right': 'items-end justify-end',
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

const valueLabel = (v: MenuValue) => (typeof v === 'string' ? v : v.label)
const valueDesc = (v: MenuValue) => (typeof v === 'string' ? undefined : v.description)

export function MenuList() {
  const [menu, setMenu] = useState<MenuData | null>(null)
  const [selected, setSelected] = useState(0)
  const [scroll, setScroll] = useState<Record<number, number>>({})
  const [checks, setChecks] = useState<Record<number, boolean>>({})
  const listRef = useRef<HTMLDivElement>(null)
  const interactive = menu ? menu.disableInput !== true : false

  const emitSelected = useCallback((items: MenuItem[], idx: number, scrollMap: Record<number, number>) => {
    const it = items[idx]
    if (!it) return
    fetchNui('changeSelected', it.values ? [idx, scrollMap[idx] ?? 0] : [idx])
  }, [])

  useNuiEvent<MenuData>('setMenu', (data) => {
    const initScroll: Record<number, number> = {}
    const initChecks: Record<number, boolean> = {}
    data.items.forEach((it, i) => {
      if (it.values) initScroll[i] = Math.max(0, (it.defaultIndex ?? 1) - 1)
      if (it.checked !== undefined) initChecks[i] = !!it.checked
    })
    const start = Math.min(Math.max(0, data.startItemIndex ?? 0), data.items.length - 1)
    setScroll(initScroll)
    setChecks(initChecks)
    setMenu(data)
    setSelected(start)
    emitSelected(data.items, start, initScroll)
  })
  useNuiEvent('closeMenu', () => setMenu(null))

  const closeWithKey = useCallback(
    (key?: 'Escape' | 'Backspace') => {
      setMenu(null)
      fetchNui('closeMenu', key)
    },
    [],
  )

  const select = useCallback(
    (idx: number) => {
      if (!menu) return
      setSelected(idx)
      emitSelected(menu.items, idx, scroll)
    },
    [menu, scroll, emitSelected],
  )

  const cycleValue = useCallback(
    (idx: number, dir: 1 | -1) => {
      if (!menu) return
      const it = menu.items[idx]
      if (!it.values?.length) return
      const len = it.values.length
      const next = ((scroll[idx] ?? 0) + dir + len) % len
      setScroll((s) => ({ ...s, [idx]: next }))
      fetchNui('changeIndex', [idx, next])
    },
    [menu, scroll],
  )

  const confirm = useCallback(
    (idx: number) => {
      if (!menu) return
      const it = menu.items[idx]

      if (it.checked !== undefined) {
        const next = !checks[idx]
        setChecks((c) => ({ ...c, [idx]: next }))
        fetchNui('changeChecked', [idx, next])
        return
      }

      fetchNui('confirmSelected', it.values ? [idx, scroll[idx] ?? 0] : [idx])
      if (it.close !== false) setMenu(null)
    },
    [menu, scroll, checks],
  )

  useEffect(() => {
    if (!menu || !interactive) return
    const n = menu.items.length
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          select((selected + 1) % n)
          break
        case 'ArrowUp':
          e.preventDefault()
          select((selected - 1 + n) % n)
          break
        case 'ArrowLeft':
          e.preventDefault()
          cycleValue(selected, -1)
          break
        case 'ArrowRight':
          e.preventDefault()
          cycleValue(selected, 1)
          break
        case 'Enter':
          e.preventDefault()
          confirm(selected)
          break
        case 'Escape':
          e.preventDefault()
          if (menu.canClose !== false) closeWithKey('Escape')
          break
        case 'Backspace':
          e.preventDefault()
          if (menu.canClose !== false) closeWithKey('Backspace')
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menu, interactive, selected, select, cycleValue, confirm, closeWithKey])

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-mindex="${selected}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  const pos = menu?.position ?? 'top-left'

  return (
    <div className={`pointer-events-none fixed inset-0 z-[550] flex p-[2.4vh] ${ANCHOR[pos] ?? ANCHOR['top-left']}`}>
      <AnimatePresence>
        {menu && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex max-h-[80vh] w-[340px] flex-col overflow-hidden rounded-[18px] border-[0.5px] border-white/10 bg-panel [box-shadow:var(--shadow-float),inset_0_1px_0_rgba(255,255,255,0.07)]"
          >

            <header className="relative shrink-0 border-b-[0.5px] border-sep bg-panel-hi px-4 py-3 text-center">
              <span className="absolute inset-x-[28%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,165,36,0.55),transparent)]" />
              <h2 className="truncate text-[14.5px] font-semibold leading-tight tracking-[-0.015em] text-fg">
                {menu.title}
              </h2>
              <span className="mt-px block font-display text-[8px] font-semibold uppercase tracking-[0.24em] text-fg-mute">
                {menu.items.length} {menu.items.length === 1 ? 'option' : 'options'}
              </span>
            </header>

            <div ref={listRef} className="sb-scroll flex flex-col">
              {menu.items.map((it, i) => (
                <Row
                  key={i}
                  index={i}
                  item={it}
                  active={selected === i}
                  scrollIndex={scroll[i] ?? 0}
                  checked={checks[i] ?? false}
                  interactive={interactive}
                  onHover={() => interactive && select(i)}
                  onConfirm={() => confirm(i)}
                  onCycle={(d) => cycleValue(i, d)}
                />
              ))}
            </div>

            {interactive && (
              <footer className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 border-t-[0.5px] border-sep bg-panel-hi px-3 py-2">
                <Hint kbd="↑↓" label="Move" />
                <Hint kbd="↵" label="Select" />
                {menu.canClose !== false && <Hint kbd="Esc" label="Close" />}
              </footer>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface RowProps {
  index: number
  item: MenuItem
  active: boolean
  scrollIndex: number
  checked: boolean
  interactive: boolean
  onHover: () => void
  onConfirm: () => void
  onCycle: (dir: 1 | -1) => void
}

function Arrow({ dir, onClick }: { dir: 'left' | 'right'; onClick: (e: React.MouseEvent) => void }) {
  return (
    <span
      role="button"
      onClick={onClick}
      className="grid h-[18px] w-[18px] place-items-center rounded-[5px] text-[9px] text-fg-mute transition-colors hover:bg-white/10 hover:text-fg"
    >
      <Icon icon={dir === 'left' ? 'chevron-left' : 'chevron-right'} fixedWidth />
    </span>
  )
}

function Row({ index, item, active, scrollIndex, checked, interactive, onHover, onConfirm, onCycle }: RowProps) {
  const isCheckbox = item.checked !== undefined
  const value = item.values?.[scrollIndex]
  const desc = (value && valueDesc(value)) ?? item.description
  const progColor = item.colorScheme ? SCHEME[item.colorScheme] ?? 'var(--rs-accent)' : null

  return (
    <button
      type="button"
      data-mindex={index}
      onMouseEnter={onHover}
      onClick={interactive ? onConfirm : undefined}
      className={[
        'group relative flex w-full items-center gap-3 border-b-[0.5px] border-sep px-4 py-2.5 text-left transition-colors duration-150 last:border-b-0',
        active ? 'bg-accent-soft' : 'hover:bg-white/[0.03]',
        interactive ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
    >
      {active && <span className="absolute inset-y-0 left-0 w-[2px] bg-accent [box-shadow:0_0_10px_var(--rs-accent)]" />}

      {item.icon && (
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] text-[12.5px] [background:var(--tint-slate)] [box-shadow:var(--shadow-inset-tile)]"
          style={{ color: item.iconColor ?? 'rgba(255,255,255,0.85)' }}
        >
          <Icon icon={item.icon} fixedWidth />
        </span>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium tracking-[-0.005em] text-fg">
            {item.label}
          </span>

          {item.values?.length ? (
            <span className="flex shrink-0 items-center gap-1">
              <Arrow dir="left" onClick={(e) => { e.stopPropagation(); onCycle(-1) }} />
              <span
                className={`min-w-[54px] text-center text-[12px] font-medium transition-colors ${
                  active ? 'text-accent' : 'text-fg-soft'
                }`}
              >
                {value ? valueLabel(value) : ''}
              </span>
              <Arrow dir="right" onClick={(e) => { e.stopPropagation(); onCycle(1) }} />
            </span>
          ) : isCheckbox ? (
            <span
              className={`grid h-[20px] w-[20px] shrink-0 place-items-center rounded-[6px] border-[0.5px] text-[10px] transition-colors ${
                checked ? 'border-accent bg-accent text-[#0b0705]' : 'border-white/20 bg-transparent text-transparent'
              }`}
            >
              <Icon icon="check" fixedWidth />
            </span>
          ) : null}
        </div>

        {desc && <p className="truncate text-[11.5px] leading-[1.4] text-fg-mute">{desc}</p>}

        {typeof item.progress === 'number' && (
          <div className="mt-0.5 h-[4px] w-full overflow-hidden rounded-pill bg-white/[0.08]">
            <div
              className="h-full rounded-pill transition-[width] duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, item.progress))}%`,
                background: progColor ?? 'linear-gradient(90deg, var(--rs-accent), var(--rs-accent-hi))',
              }}
            />
          </div>
        )}
      </div>
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
