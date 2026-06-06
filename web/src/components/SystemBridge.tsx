import { useEffect } from 'react'
import { useNuiEvent } from '@/nui/useNuiEvent'
import { fetchNui } from '@/nui/nui'
import { setLocaleData } from '@/nui/locale'

export function SystemBridge() {
  useEffect(() => {
    fetchNui('init')
  }, [])

  useNuiEvent<Record<string, unknown>>('setLocale', (data) => setLocaleData(data))

  useNuiEvent<string>('setClipboard', (text) => {
    if (!text) return
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    } catch {
      navigator.clipboard?.writeText(text).catch(() => {})
    }
  })

  return null
}
