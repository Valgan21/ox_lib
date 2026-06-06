import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNuiEvent } from '@/nui/useNuiEvent'
import { fetchNui } from '@/nui/nui'
import { Icon } from '../Icon'

type Difficulty = 'easy' | 'medium' | 'hard' | { areaSize: number; speedMultiplier: number }

interface SkillCheckData {
  difficulty: Difficulty | Difficulty[]
  inputs?: string[]
}

interface Round {
  areaSize: number
  speedMultiplier: number
}

const PRESETS: Record<string, Round> = {
  easy: { areaSize: 50, speedMultiplier: 1 },
  medium: { areaSize: 40, speedMultiplier: 1.5 },
  hard: { areaSize: 25, speedMultiplier: 1.75 },
}

const resolve = (d: Difficulty): Round => (typeof d === 'string' ? PRESETS[d] ?? PRESETS.medium : d)
const toRounds = (d: SkillCheckData['difficulty']): Round[] => (Array.isArray(d) ? d.map(resolve) : [resolve(d)])

const BASE_SPEED = 230
const SIZE = 220
const C = SIZE / 2
const R = 92

function polar(deg: number) {
  const a = ((deg - 90) * Math.PI) / 180
  return { x: C + R * Math.cos(a), y: C + R * Math.sin(a) }
}

function describeArc(startDeg: number, endDeg: number) {
  const s = polar(endDeg)
  const e = polar(startDeg)
  const large = endDeg - startDeg <= 180 ? '0' : '1'
  return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 0 ${e.x} ${e.y}`
}

export function SkillCheck() {
  const [sc, setSc] = useState<{ rounds: Round[]; inputs: string[] } | null>(null)
  const [round, setRound] = useState(0)
  const [angle, setAngle] = useState(0)
  const [result, setResult] = useState<'success' | 'fail' | null>(null)

  const params = useRef({ key: 'e', areaStart: 120, areaSize: 40, speed: BASE_SPEED })
  const angleRef = useRef(0)
  const doneRef = useRef(false)

  const finish = useCallback((success: boolean) => {
    if (doneRef.current) return
    doneRef.current = true
    setResult(success ? 'success' : 'fail')
    window.setTimeout(() => {
      setSc(null)
      setResult(null)
      setRound(0)
      fetchNui('skillCheckOver', success)
    }, 280)
  }, [])

  useNuiEvent<SkillCheckData>('startSkillCheck', (data) => {
    doneRef.current = false
    setResult(null)
    setRound(0)
    setSc({
      rounds: toRounds(data.difficulty),
      inputs: (data.inputs?.length ? data.inputs : ['e']).map((k) => k.toLowerCase()),
    })
  })
  useNuiEvent('skillCheckCancel', () => finish(false))

  useEffect(() => {
    if (!sc) return
    const r = sc.rounds[round] ?? PRESETS.medium
    const areaSize = Math.min(120, Math.max(8, r.areaSize))
    const areaStart = 80 + Math.random() * (240 - areaSize)
    const key = sc.inputs[Math.floor(Math.random() * sc.inputs.length)]
    params.current = { key, areaStart, areaSize, speed: BASE_SPEED * (r.speedMultiplier || 1) }
    angleRef.current = 0
    setAngle(0)

    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      if (doneRef.current) return
      const dt = (now - last) / 1000
      last = now
      angleRef.current += params.current.speed * dt
      if (angleRef.current >= 360) return finish(false)
      setAngle(angleRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [sc, round, finish])

  useEffect(() => {
    if (!sc) return
    const onKey = (e: KeyboardEvent) => {
      if (doneRef.current) return
      const k = e.key.toLowerCase()
      if (!sc.inputs.includes(k)) return
      e.preventDefault()
      const { key, areaStart, areaSize } = params.current
      const a = angleRef.current % 360
      const inZone = a >= areaStart && a <= areaStart + areaSize
      if (k === key && inZone) {
        if (round + 1 < sc.rounds.length) setRound((r) => r + 1)
        else finish(true)
      } else {
        finish(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sc, round, finish])

  const color =
    result === 'success' ? 'var(--rs-success)' : result === 'fail' ? 'var(--rs-danger)' : 'var(--rs-accent)'
  const rgb = result === 'success' ? '52,199,123' : result === 'fail' ? '255,69,58' : '245,165,36'
  const handle = polar(angle % 360)

  return (
    <AnimatePresence>
      {sc && (
        <motion.div
          key="skillcheck"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="pointer-events-none fixed inset-0 z-[1200] grid place-items-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="relative flex flex-col items-center gap-4 [filter:drop-shadow(0_8px_24px_rgba(0,0,0,0.6))]"
          >
            <div className="relative" style={{ width: SIZE, height: SIZE }}>
              <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>

                <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="8" />
                <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />

                <path
                  d={describeArc(params.current.areaStart, params.current.areaStart + params.current.areaSize)}
                  fill="none"
                  stroke={color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px rgba(${rgb},0.7))`, transition: 'stroke 0.15s' }}
                />

                <circle
                  cx={handle.x}
                  cy={handle.y}
                  r="7"
                  fill="#fff"
                  stroke={color}
                  strokeWidth="3"
                  style={{ filter: `drop-shadow(0 0 5px rgba(${rgb},0.8))` }}
                />
              </svg>

              <div className="absolute inset-0 grid place-items-center">
                {result ? (
                  <span
                    className="grid h-12 w-12 place-items-center rounded-full text-[22px]"
                    style={{ background: `rgba(${rgb},0.15)`, color, boxShadow: `inset 0 0 0 0.5px rgba(${rgb},0.4)` }}
                  >
                    <Icon icon={result === 'success' ? 'check' : 'xmark'} fixedWidth />
                  </span>
                ) : (
                  <span
                    className="grid h-12 min-w-[48px] place-items-center rounded-[11px] border-[0.5px] border-accent/60 bg-gradient-to-b from-accent-hi to-accent px-3 font-mono text-[22px] font-bold uppercase leading-none text-[#0b0705] [box-shadow:inset_0_2px_0_rgba(255,255,255,0.45),inset_0_-2px_0_rgba(0,0,0,0.2),0_4px_14px_rgba(245,165,36,0.5)]"
                  >
                    {params.current.key}
                  </span>
                )}
              </div>
            </div>

            {sc.rounds.length > 1 && (
              <div className="flex items-center gap-2">
                {sc.rounds.map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-200"
                    style={{
                      width: i === round ? 18 : 6,
                      background: i < round ? 'var(--rs-success)' : i === round ? 'var(--rs-accent)' : 'rgba(255,255,255,0.2)',
                      boxShadow: i === round ? '0 0 8px rgba(245,165,36,0.6)' : 'none',
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
