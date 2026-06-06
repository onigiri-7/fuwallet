'use client'

import { useState, useEffect } from 'react'

interface Shift {
  id: string
  date: string
  hours: number
  wage: number
}

const FUYOU_LIMIT = 1_030_000

export default function FuwalletApp() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: '', hours: '', wage: '' })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('fuwallet_shifts')
    if (saved) setShifts(JSON.parse(saved))
  }, [])

  const saveShifts = (next: Shift[]) => {
    setShifts(next)
    localStorage.setItem('fuwallet_shifts', JSON.stringify(next))
  }

  const addShift = () => {
    if (!form.date || !form.hours || !form.wage) return
    const newShift: Shift = {
      id: Date.now().toString(),
      date: form.date,
      hours: parseFloat(form.hours),
      wage: parseInt(form.wage),
    }
    saveShifts([...shifts, newShift])
    setForm({ date: '', hours: '', wage: '' })
    setShowForm(false)
  }

  const deleteShift = (id: string) => {
    saveShifts(shifts.filter((s) => s.id !== id))
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const yearlyTotal = shifts
    .filter((s) => new Date(s.date).getFullYear() === currentYear)
    .reduce((sum, s) => sum + s.hours * s.wage, 0)

  const monthlyTotal = shifts
    .filter((s) => {
      const d = new Date(s.date)
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth
    })
    .reduce((sum, s) => sum + s.hours * s.wage, 0)

  const remaining = FUYOU_LIMIT - yearlyTotal
  const progress = Math.min((yearlyTotal / FUYOU_LIMIT) * 100, 100)

  const progressColor =
    progress >= 90 ? 'bg-red-500' : progress >= 70 ? 'bg-yellow-400' : 'bg-green-500'

  const remainingColor =
    remaining < 0 ? 'text-red-500' : remaining < 100_000 ? 'text-yellow-500' : 'text-green-600'

  const fmt = (n: number) => `¥${Math.round(Math.abs(n)).toLocaleString()}`

  const sortedShifts = [...shifts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-800">Fuwallet 🍙</h1>
        <p className="text-xs text-gray-400 mt-0.5">バイト大学生の扶養管理アプリ</p>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* 扶養残りカード */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">扶養上限まで残り</p>
          <p className={`text-4xl font-bold ${remainingColor}`}>
            {remaining < 0 ? `-${fmt(remaining)}` : fmt(remaining)}
          </p>
          {remaining < 0 && (
            <p className="text-xs text-red-500 mt-1">⚠️ 扶養上限を超えています</p>
          )}

          {/* プログレスバー */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{fmt(yearlyTotal)} 稼いだ</span>
              <span>上限 {fmt(FUYOU_LIMIT)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${progressColor}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-right text-xs text-gray-400 mt-1">{progress.toFixed(1)}%</p>
          </div>
        </div>

        {/* 今月の給料 */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">
            今月（{currentYear}/{String(currentMonth + 1).padStart(2, '0')}）
          </p>
          <p className="text-2xl font-bold text-gray-800">{fmt(monthlyTotal)}</p>
        </div>

        {/* シフト追加ボタン */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 rounded-2xl transition-colors"
        >
          {showForm ? '✕ 閉じる' : '＋ シフトを追加'}
        </button>

        {/* シフト入力フォーム */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <p className="font-medium text-gray-700">シフトを入力</p>
            <div>
              <label className="text-xs text-gray-500">日付</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">勤務時間（時間）</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="例: 5.5"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">時給（円）</label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="例: 1050"
                value={form.wage}
                onChange={(e) => setForm({ ...form, wage: e.target.value })}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            {form.hours && form.wage && (
              <p className="text-sm text-gray-500">
                この日の給料：
                <span className="font-bold text-gray-800">
                  {fmt(parseFloat(form.hours) * parseInt(form.wage))}
                </span>
              </p>
            )}
            <button
              onClick={addShift}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 rounded-xl transition-colors"
            >
              追加する
            </button>
          </div>
        )}

        {/* シフト一覧 */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="font-medium text-gray-700 mb-3">シフト一覧</p>
          {sortedShifts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              まだシフトがありません
            </p>
          ) : (
            <ul className="space-y-2">
              {sortedShifts.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700">{s.date}</p>
                    <p className="text-xs text-gray-400">
                      {s.hours}h × ¥{s.wage.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-gray-800">
                      {fmt(s.hours * s.wage)}
                    </p>
                    <button
                      onClick={() => deleteShift(s.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
