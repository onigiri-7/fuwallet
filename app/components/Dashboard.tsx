'use client'

import { useShifts, calcEarnings } from './useShifts'

// 2025年税制改正後（大学生・19〜22歳向け）
const NENKIN_LIMIT = 1_280_000  // 国民年金・学生納付特例の申請基準（前年の所得）
const FULL_LIMIT   = 1_500_000  // 特定親族特別控除 満額 + 社会保険の扶養
const ZERO_LIMIT   = 1_880_000  // 特定親族特別控除 完全ゼロ

const NENKIN_PCT = (NENKIN_LIMIT / ZERO_LIMIT) * 100  // ≈68.1%
const MARKER_PCT = (FULL_LIMIT  / ZERO_LIMIT) * 100  // ≈79.8%

const fmt = (n: number) => `¥${Math.round(Math.abs(n)).toLocaleString()}`

export default function Dashboard() {
  const { shifts, mounted } = useShifts()
  if (!mounted) return null

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const earningsOf = (s: { startTime: string; endTime: string; wage: number }) =>
    calcEarnings(s.startTime, s.endTime, s.wage).total

  const yearlyTotal = shifts
    .filter((s) => new Date(s.date).getFullYear() === year)
    .reduce((sum, s) => sum + earningsOf(s), 0)

  const monthlyTotal = shifts
    .filter((s) => {
      const d = new Date(s.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
    .reduce((sum, s) => sum + earningsOf(s), 0)

  const isOver150 = yearlyTotal > FULL_LIMIT
  const isOver188 = yearlyTotal > ZERO_LIMIT

  const remaining = FULL_LIMIT - yearlyTotal
  const remainingColor = isOver150 ? 'text-red-500' : remaining < 200_000 ? 'text-yellow-500' : 'text-green-600'

  // 全体バー（0〜188万）における各幅
  const greenWidth = Math.min(yearlyTotal / ZERO_LIMIT * 100, MARKER_PCT)
  const yellowWidth = isOver150
    ? Math.min((yearlyTotal - FULL_LIMIT) / ZERO_LIMIT * 100, 100 - MARKER_PCT)
    : 0

  return (
    <div className="space-y-4">
      {/* メインカード */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <p className="text-xs text-gray-400 mb-1">
          {isOver150 ? '逓減ゾーン突入' : '150万円まで残り'}
        </p>
        <p className={`text-4xl font-bold ${remainingColor}`}>
          {isOver150 ? `+${fmt(yearlyTotal - FULL_LIMIT)}` : fmt(remaining)}
        </p>

        {!isOver150 && (
          <p className="text-xs text-gray-400 mt-0.5">
            ここまで親の控除（63万円）が満額・社会保険も安全
          </p>
        )}
        {isOver150 && !isOver188 && (
          <p className="text-xs text-yellow-500 mt-0.5 font-medium">
            ⚠️ 国保加入が必要 + 控除が逓減中（188万で完全アウト）
          </p>
        )}
        {isOver188 && (
          <p className="text-xs text-red-500 mt-0.5 font-medium">
            ⚠️ 188万円超 — 扶養控除ゼロ
          </p>
        )}

        {/* セグメントバー */}
        <div className="mt-5">
          {/* バー本体 */}
          <div className="relative w-full h-3 bg-gray-100 rounded-full">
            {/* 緑（0〜150万） */}
            <div
              className={`absolute left-0 top-0 h-full bg-green-500 transition-all ${isOver150 ? 'rounded-l-full' : 'rounded-full'}`}
              style={{ width: `${greenWidth}%` }}
            />
            {/* 黄（150〜188万） */}
            {yellowWidth > 0 && (
              <div
                className="absolute top-0 h-full bg-yellow-400 rounded-r-full transition-all"
                style={{ left: `${MARKER_PCT}%`, width: `${yellowWidth}%` }}
              />
            )}
            {/* 年金特例マーカーライン（オレンジ） */}
            <div
              className="absolute top-[-3px] bottom-[-3px] w-0.5 bg-orange-400 z-10 rounded-full"
              style={{ left: `${NENKIN_PCT}%` }}
            />
            {/* 国保マーカーライン（青） */}
            <div
              className="absolute top-[-3px] bottom-[-3px] w-0.5 bg-blue-400 z-10 rounded-full"
              style={{ left: `${MARKER_PCT}%` }}
            />
          </div>

          {/* ラベル行1（年金は上段、稼いだ額と188万は両端） */}
          <div className="relative h-5 mt-1">
            <span className="absolute left-0 text-xs text-gray-400">
              {fmt(yearlyTotal)} 稼いだ
            </span>
            <span
              className="absolute text-xs text-orange-400 font-medium -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${NENKIN_PCT}%` }}
            >
              128万・年金特例
            </span>
            <span className="absolute right-0 text-xs text-gray-400">188万</span>
          </div>

          {/* ラベル行2（国保は下段、位置をずらして重なりを回避） */}
          <div className="relative h-5">
            <span
              className="absolute text-xs text-blue-400 font-medium -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${MARKER_PCT}%` }}
            >
              150万・国保加入
            </span>
          </div>

          <p className="text-xs text-gray-300 mt-1">
            ※ 年金特例は今年の所得が来年の申請判定に使われます
          </p>
        </div>
      </div>

      {/* 壁の説明カード */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <p className="text-sm font-medium text-gray-700 mb-3">大学生（19〜22歳）の壁 2025年〜</p>
        <div className="space-y-3">
          {[
            {
              amount: '〜150万円',
              dot: 'bg-green-500',
              label: '親の控除（63万円）が満額',
              sub: '社会保険も親の扶養のままでOK',
            },
            {
              amount: '128万円（前年所得）',
              dot: 'bg-orange-400',
              label: '国民年金・学生納付特例の申請ライン',
              sub: '今年の所得が128万以下なら来年の年金保険料を猶予申請できる',
            },
            {
              amount: '150万円',
              dot: 'bg-blue-400',
              label: '国民健康保険への加入が必要',
              sub: '同時に親の控除も逓減スタート',
            },
            {
              amount: '150〜188万円',
              dot: 'bg-yellow-400',
              label: '控除が段階的に減る（逓減）',
              sub: '188万に近づくほど親の税負担が増える',
            },
            {
              amount: '188万円超',
              dot: 'bg-red-500',
              label: '扶養控除が完全にゼロ',
              sub: '親が63万円の控除を丸ごと失う',
            },
          ].map((row) => (
            <div key={row.amount} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${row.dot}`} />
              <div>
                <span className="text-sm font-medium text-gray-700">{row.amount}</span>
                <p className="text-xs text-gray-500">{row.label}</p>
                <p className="text-xs text-gray-400">{row.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-300 mt-3 border-t border-gray-100 pt-3">
          ※ 2025年税制改正「特定親族特別控除」による
        </p>
      </div>

      {/* 今月 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <p className="text-sm text-gray-500 mb-1">
          今月（{year}/{String(month + 1).padStart(2, '0')}）
        </p>
        <p className="text-2xl font-bold text-gray-800">{fmt(monthlyTotal)}</p>
      </div>

      {/* 月別内訳 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <p className="text-sm font-medium text-gray-700 mb-3">今年の月別合計</p>
        <div className="space-y-2">
          {Array.from({ length: month + 1 }, (_, i) => {
            const total = shifts
              .filter((s) => {
                const d = new Date(s.date)
                return d.getFullYear() === year && d.getMonth() === i
              })
              .reduce((sum, s) => sum + earningsOf(s), 0)
            if (total === 0) return null
            return (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{i + 1}月</span>
                <span className="text-sm font-medium text-gray-800">{fmt(total)}</span>
              </div>
            )
          })}
          {shifts.filter((s) => new Date(s.date).getFullYear() === year).length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">まだシフトがありません</p>
          )}
        </div>
      </div>
    </div>
  )
}
