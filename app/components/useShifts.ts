'use client'

import { useState, useEffect } from 'react'

export interface Shift {
  id: string
  date: string
  startTime: string
  endTime: string
  wage: number
  jobName: string
}

const KEY = 'fuwallet_shifts'

/** 深夜割増込みの給料計算（22:00〜5:00 は ×1.25） */
export function calcEarnings(startTime: string, endTime: string, wage: number) {
  if (!startTime || !endTime || !wage) {
    return { regularHours: 0, nightHours: 0, total: 0 }
  }

  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)

  let startMin = sh * 60 + sm
  let endMin = eh * 60 + em

  // 日またぎ対応（例：23:00〜2:00）
  if (endMin <= startMin) endMin += 24 * 60

  // 深夜帯（22:00〜翌5:00）を分単位で表現
  const nightPeriods: [number, number][] = [
    [0, 5 * 60],          // 0:00〜5:00
    [22 * 60, 29 * 60],   // 22:00〜翌5:00
    [46 * 60, 53 * 60],   // 翌22:00〜翌々5:00（長時間シフト保険）
  ]

  let nightMin = 0
  for (const [ns, ne] of nightPeriods) {
    const os = Math.max(startMin, ns)
    const oe = Math.min(endMin, ne)
    if (oe > os) nightMin += oe - os
  }

  const totalMin = endMin - startMin
  const regularMin = totalMin - nightMin

  const regularHours = regularMin / 60
  const nightHours = nightMin / 60
  const total = regularHours * wage + nightHours * wage * 1.25

  return { regularHours, nightHours, total }
}

export function useShifts() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(KEY)
    if (saved) setShifts(JSON.parse(saved))
  }, [])

  const save = (next: Shift[]) => {
    setShifts(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }

  const addShift = (date: string, startTime: string, endTime: string, wage: number, jobName: string) => {
    save([...shifts, { id: Date.now().toString(), date, startTime, endTime, wage, jobName }])
  }

  const deleteShift = (id: string) => {
    save(shifts.filter((s) => s.id !== id))
  }

  return { shifts, addShift, deleteShift, mounted }
}
