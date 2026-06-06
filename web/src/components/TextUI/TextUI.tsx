import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useNuiEvent } from '@/nui/useNuiEvent'
import type { TextUIData, TextUIPosition } from '@/types'
import { Icon } from '../Icon'

const ALIGN: Record<TextUIPosition, string> = {
  'right-center': 'items-center justify-end pr-[2.6vw]',
  'left-center': 'items-center justify-start pl-[2.6vw]',
  'top-center': 'items-start justify-center pt-[3.5vh]',
  'bottom-center': 'items-end justify-center pb-[12vh]',
}

function parsePrompt(text: string): { key: string | null; rest: string } {
  const clean = text.replace(/~[a-z0-9_]+~/gi, '').replace(/\^[0-9]/g, '')
  const bracket = clean.match(/^\s*\[([^\]]{1,12})\]\s*([\s\S]*)$/)
  if (bracket) return { key: bracket[1].trim(), rest: bracket[2].trim() }
  return { key: null, rest: clean.trim() }
}

export function TextUI() {
  const [data, setData] = useState<TextUIData | null>(null)
  const [pos, setPos] = useState<TextUIPosition>('right-center')

  useNuiEvent<TextUIData>('textUi', (d) => {
    setPos(d.position ?? 'right-center')
    setData(d)
  })
  useNuiEvent('textUiHide', () => setData(null))

  const alignIcon = data?.alignIcon ?? 'center'
  const parsed = data ? parsePrompt(data.text) : { key: null, rest: '' }

  return (
    <div className={`pointer-events-none fixed inset-0 z-[400] flex ${ALIGN[pos] ?? ALIGN['right-center']}`}>
      <AnimatePresence>
        {data && (
          <motion.div
            key="textui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              backgroundImage: parsed.key
                ? 'radial-gradient(120% 130% at 0% 50%, rgba(245,165,36,0.12) 0%, transparent 52%)'
                : undefined,
              ...data.style,
            }}
            className={`relative flex max-w-[360px] gap-3 rounded-[14px] border-[0.5px] border-white/10 bg-panel py-2.5 pl-2.5 pr-4 [box-shadow:var(--shadow-float),inset_0_1px_0_rgba(255,255,255,0.07)] ${
              alignIcon === 'top' ? 'items-start' : 'items-center'
            }`}
          >

            <span className="absolute inset-x-[24%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,165,36,0.55),transparent)]" />

            {parsed.key ? (
              <span
                className="grid h-8 min-w-[32px] shrink-0 place-items-center rounded-[8px] border-[0.5px] border-accent/60 bg-gradient-to-b from-accent-hi to-accent px-2 font-mono text-[14px] font-bold uppercase leading-none text-[#0b0705] [box-shadow:inset_0_1.5px_0_rgba(255,255,255,0.45),inset_0_-2px_0_rgba(0,0,0,0.2),0_3px_12px_rgba(245,165,36,0.5)]"
              >
                {parsed.key}
              </span>
            ) : data.icon ? (
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] text-[14px] [background:var(--tint-slate)] [box-shadow:var(--shadow-inset-tile)]"
                style={{ color: data.iconColor ?? 'var(--rs-accent)' }}
              >
                <Icon icon={data.icon} fixedWidth />
              </span>
            ) : null}

            {parsed.rest && (
              <div className="textui-md min-w-0 flex-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.rest}</ReactMarkdown>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
