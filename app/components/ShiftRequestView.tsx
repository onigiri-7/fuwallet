'use client'

import { useState } from 'react'
import { useShiftRequest, Preference } from './useShiftRequest'

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

const PREF_STYLE: Record<NonNullable<Preference>, { bg: string; text: string; label: string }> = {
  '◎': { bg: 'bg-green-100', text: 'text-green-700', label: '◎' },
  '○': { bg: 'bg-blue-100',  text: 'text-blue-600',  label: '○' },
  '×': { bg: 'bg-gray-100',  text: 'text-gray-400',  label: '×' },
}

export default function ShiftRequestView() {
  const { data, togglePreference, updateName, updateWorkplace, clearMonth, mounted } = useShiftRequest()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [isPrintView, setIsPrintView] = useState(false)

  if (!mounted) return null

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const toDateStr = (d: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const legend = [
    { pref: '◎' as const, desc: '希望' },
    { pref: '○' as const, desc: '可能' },
    { pref: '×' as const, desc: '不可' },
  ]

  if (isPrintView) {
    return (
      <div className="space-y-4">
        {/* 印刷/スクショ用ビュー */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-lg">シフト希望表</h2>
            <button
              onClick={() => setIsPrintView(false)}
              className="text-sm text-orange-500 font-medium"
            >
              編集に戻る
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">{data.workplace || 'バイト先未設定'}</p>
                <p className="text-xs text-gray-400">シフト希望表</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{data.name || '名前未設定'}</p>
                <p className="text-sm font-bold text-gray-800">{year}年{month + 1}月</p>
              </div>
            </div>

            {/* カレンダーグリッド */}
            <div className="grid grid-cols-7 gap-1">
              {DAY_LABELS.map((label, i) => (
                <div key={label} className={`text-center text-xs font-medium py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                  {label}
                </div>
              ))}
              {cells.map((day, i) => {
                if (!day) return <div key={`pad-${i}`} className="aspect-square" />
                const dateStr = toDateStr(day)
                const pref = data.preferences[dateStr] ?? null
                const dayOfWeek = (firstDayOfWeek + day - 1) % 7
                const style = pref ? PREF_STYLE[pref] : null
                return (
                  <div
                    key={dateStr}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg ${style ? style.bg : 'bg-gray-50'}`}
                  >
                    <span className={`text-xs ${dayOfWeek === 0 ? 'text-red-400' : dayOfWeek === 6 ? 'text-blue-400' : 'text-gray-600'}`}>
                      {day}
                    </span>
                    {pref && (
                      <span className={`text-xs font-bold ${style!.text}`}>{style!.label}</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* 凡例 */}
            <div className="flex gap-4 pt-2 border-t border-gray-100">
              {legend.map(({ pref, desc }) => (
                <div key={pref} className="flex items-center gap-1">
                  <span className={`text-xs font-bold ${PREF_STYLE[pref].text}`}>{pref}</span>
                  <span className="text-xs text-gray-400">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">スクリーンショットして提出してください</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 名前・バイト先入力 */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <p className="text-sm font-medium text-gray-700">基本情報</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">名前</label>
            <input
              type="text"
              value={data.name}
              onChange={e => updateName(e.target.value)}
              placeholder="山田 太郎"
              className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">バイト先</label>
            <input
              type="text"
              value={data.workplace}
              onChange={e => updateWorkplace(e.target.value)}
              placeholder="〇〇レストラン"
              className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>
      </div>

      {/* カレンダー */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-xl">‹</button>
          <p className="font-bold text-gray-800">{year}年{month + 1}月</p>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-xl">›</button>
        </div>

        {/* 凡例 */}
        <div className="flex gap-4 px-5 py-2 border-b border-gray-100">
          {legend.map(({ pref, desc }) => (
            <div key={pref} className="flex items-center gap-1">
              <span className={`text-xs font-bold ${PREF_STYLE[pref].text}`}>{pref}</span>
              <span className="text-xs text-gray-400">{desc}</span>
            </div>
          ))}
          <span className="text-xs text-gray-300 ml-auto">タップで切替</span>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAY_LABELS.map((label, i) => (
            <div key={label} className={`text-center text-xs font-medium py-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 p-2 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`pad-${i}`} className="aspect-square" />
            const dateStr = toDateStr(day)
            const pref = data.preferences[dateStr] ?? null
            const dayOfWeek = (firstDayOfWeek + day - 1) % 7
            const style = pref ? PREF_STYLE[pref] : null
            return (
              <button
                key={dateStr}
                onClick={() => togglePreference(dateStr)}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-colors ${style ? style.bg : 'hover:bg-gray-50'}`}
              >
                <span className={`text-sm font-medium ${dayOfWeek === 0 ? 'text-red-400' : dayOfWeek === 6 ? 'text-blue-400' : 'text-gray-700'}`}>
                  {day}
                </span>
                {pref && (
                  <span className={`text-xs font-bold ${style!.text}`}>{style!.label}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <button
          onClick={() => clearMonth(year, month)}
          className="flex-1 border border-gray-200 text-gray-500 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
        >
          この月をリセット
        </button>
        <button
          onClick={() => setIsPrintView(true)}
          className="flex-1 bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
        >
          スクショ用に表示
        </button>
      </div>
    </div>
  )
}
