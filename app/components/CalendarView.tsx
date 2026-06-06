'use client'

import { useState } from 'react'
import { useShifts, calcEarnings } from './useShifts'
import ShiftModal from './ShiftModal'

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

export default function CalendarView() {
  const { shifts, addShift, deleteShift, mounted } = useShifts()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  if (!mounted) return null

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const toDateStr = (d: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const shiftsFor = (dateStr: string) => shifts.filter((s) => s.date === dateStr)

  const totalFor = (dateStr: string) =>
    shiftsFor(dateStr).reduce(
      (sum, s) => sum + calcEarnings(s.startTime, s.endTime, s.wage).total,
      0
    )

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const monthlyTotal = shifts
    .filter((s) => {
      const d = new Date(s.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
    .reduce((sum, s) => sum + calcEarnings(s.startTime, s.endTime, s.wage).total, 0)

  return (
    <>
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* 月ナビゲーション */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500 text-xl"
            >
              ‹
            </button>
            <div className="text-center">
              <p className="font-bold text-gray-800 text-lg">{year}年{month + 1}月</p>
              {monthlyTotal > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  今月合計 ¥{Math.round(monthlyTotal).toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500 text-xl"
            >
              ›
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAY_LABELS.map((label, i) => (
              <div
                key={label}
                className={`text-center text-xs font-medium py-2 ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 p-2 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} className="aspect-square" />

              const dateStr = toDateStr(day)
              const total = totalFor(dateStr)
              const hasShift = total > 0
              const isToday = dateStr === todayStr
              const dayOfWeek = (firstDayOfWeek + day - 1) % 7

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-xl transition-colors
                    ${isToday ? 'ring-2 ring-orange-400 bg-orange-50' : 'hover:bg-gray-50'}
                    ${hasShift && !isToday ? 'bg-green-50' : ''}
                  `}
                >
                  <span
                    className={`text-sm font-medium ${
                      dayOfWeek === 0 ? 'text-red-400' : dayOfWeek === 6 ? 'text-blue-400' : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </span>
                  {hasShift && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-0.5" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">日付をタップしてシフトを入力</p>
      </div>

      {selectedDate && (
        <ShiftModal
          date={selectedDate}
          shifts={shiftsFor(selectedDate)}
          onAdd={(start, end, w, jobName) => addShift(selectedDate, start, end, w, jobName)}
          onDelete={deleteShift}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  )
}
