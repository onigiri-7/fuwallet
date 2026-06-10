'use client'

import { useState, useEffect } from 'react'

export type Preference = '◎' | '○' | '×' | null

export interface ShiftRequestData {
  name: string
  workplace: string
  preferences: Record<string, Preference>
}

const KEY = 'fuwallet_shift_request'

const nextPref = (p: Preference): Preference => {
  if (p === null) return '◎'
  if (p === '◎') return '○'
  if (p === '○') return '×'
  return null
}

export function useShiftRequest() {
  const [data, setData] = useState<ShiftRequestData>({ name: '', workplace: '', preferences: {} })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(KEY)
    if (saved) setData(JSON.parse(saved))
  }, [])

  const save = (next: ShiftRequestData) => {
    setData(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }

  const togglePreference = (dateStr: string) => {
    const current = data.preferences[dateStr] ?? null
    const next = nextPref(current)
    const prefs = { ...data.preferences }
    if (next === null) delete prefs[dateStr]
    else prefs[dateStr] = next
    save({ ...data, preferences: prefs })
  }

  const updateName = (name: string) => save({ ...data, name })
  const updateWorkplace = (workplace: string) => save({ ...data, workplace })
  const clearMonth = (year: number, month: number) => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    const prefs = Object.fromEntries(
      Object.entries(data.preferences).filter(([k]) => !k.startsWith(prefix))
    ) as Record<string, Preference>
    save({ ...data, preferences: prefs })
  }

  return { data, togglePreference, updateName, updateWorkplace, clearMonth, mounted }
}
