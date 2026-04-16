'use client'

import { useState, useEffect, useCallback } from 'react'

type Lang = 'en' | 'jp'
const STORAGE_KEY = 'tc-lang'

/**
 * Shared language hook — persists choice to localStorage.
 * Falls back to 'en' on first visit or SSR.
 */
export function useLang(): [Lang, (lang: Lang) => void, () => void] {
  const [lang, setLangState] = useState<Lang>('en')

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
      if (stored === 'en' || stored === 'jp') {
        setLangState(stored)
      }
    } catch {
      // SSR or localStorage blocked
    }
  }, [])

  // Set lang + persist
  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    try { localStorage.setItem(STORAGE_KEY, newLang) } catch {}
  }, [])

  // Toggle between en/jp
  const toggleLang = useCallback(() => {
    setLangState(prev => {
      const next = prev === 'en' ? 'jp' : 'en'
      try { localStorage.setItem(STORAGE_KEY, next) } catch {}
      return next
    })
  }, [])

  return [lang, setLang, toggleLang]
}
