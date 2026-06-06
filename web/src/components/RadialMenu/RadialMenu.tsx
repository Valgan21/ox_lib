import { useEffect, useState } from 'react'
import { useNuiEvent } from '@/nui/useNuiEvent'
import { fetchNui } from '@/nui/nui'
import type { IconValue } from '@/types'
import { Icon } from '../Icon'
import './radial.css'

interface RadialItem {
  icon: IconValue
  label: string
  menu?: string
  iconWidth?: number
  iconHeight?: number
}

interface RadialData {
  items: RadialItem[]
  sub?: boolean
  option?: number
}

const RADIUS = 132

export function RadialMenu() {
  const [menu, setMenu] = useState<RadialData | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [version, setVersion] = useState(0)

  useNuiEvent<RadialData | false>('openRadialMenu', (data) => {
    if (!data) {
      setMenu(null)
      setHover(null)
      return
    }
    setMenu(data)
    setHover(typeof data.option === 'number' ? data.option : null)
    setVersion((v) => v + 1)
  })

  const close = () => {
    setMenu(null)
    setHover(null)
    fetchNui('radialClose')
  }
  const back = () => fetchNui('radialBack')
  const click = (i: number) => fetchNui('radialClick', i)

  useEffect(() => {
    if (!menu) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      } else if (e.key === 'Backspace' && menu.sub) {
        e.preventDefault()
        back()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menu])

  if (!menu) return null

  return (
    <div
      className="radial-backdrop"
      onMouseDown={() => (menu.sub ? back() : close())}
      onContextMenu={(e) => {
        e.preventDefault()
        menu.sub ? back() : close()
      }}
    >
          <div
            className={'radial-wheel' + (menu.sub ? ' sub' : '')}
            key={version}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="radial-ring" />
            <div className="radial-sweep" />

            {menu.items.map((_, i) => {
              const step = 360 / menu.items.length
              return (
                <span
                  key={'sp' + i}
                  className={'radial-spoke' + (hover === i ? ' active' : '')}
                  style={{ transform: `rotate(${-90 + i * step}deg)`, ['--d' as never]: `${i * 28}ms` }}
                />
              )
            })}

            <button
              className={'radial-hub' + (menu.sub ? ' back' : '')}
              onClick={menu.sub ? back : undefined}
              disabled={!menu.sub}
            >
              <span
                className="radial-hub-in"
                key={hover != null ? `h${hover}` : menu.sub ? 'back' : 'idle'}
              >
                {hover != null && menu.items[hover] ? (
                  <Icon icon={menu.items[hover].icon} className="text-[24px]" fixedWidth />
                ) : menu.sub ? (
                  <Icon icon="chevron-left" className="text-[22px]" fixedWidth />
                ) : (
                  <span className="radial-hub-mark" />
                )}
                <span className="radial-hub-label">
                  {hover != null && menu.items[hover]
                    ? menu.items[hover].label
                    : menu.sub
                      ? 'Back'
                      : 'Menu'}
                </span>
              </span>
            </button>

            {menu.items.map((it, i) => {
              const step = 360 / menu.items.length
              const a = (-90 + i * step) * (Math.PI / 180)
              const x = Math.cos(a) * RADIUS
              const y = Math.sin(a) * RADIUS
              return (
                <button
                  key={i}
                  className={'radial-node' + (hover === i ? ' active' : '') + (it.menu ? ' has-sub' : '')}
                  style={{ transform: `translate(${x}px, ${y}px)`, ['--d' as never]: `${i * 28}ms` }}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                  onClick={() => click(i)}
                >
                  <span className="radial-node-icon">
                    <Icon icon={it.icon} className="text-[20px]" fixedWidth />
                  </span>
                  <span className="radial-node-label">{it.label}</span>
                </button>
              )
            })}
          </div>

      <span className="radial-hint">
        {menu.sub ? 'Click to choose · click outside to go back' : 'Click to choose · Esc to close'}
      </span>
    </div>
  )
}
