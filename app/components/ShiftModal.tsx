'use client'

import { useState, useMemo } from 'react'
import { Shift, calcEarnings, useShifts } from './useShifts'
import { useJobs, Job } from './useJobs'

interface Props {
  date: string
  shifts: Shift[]
  onAdd: (startTime: string, endTime: string, wage: number, jobName: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}

const fmt = (n: number) => `¥${Math.round(n).toLocaleString()}`
const fmtH = (h: number) => {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return mm === 0 ? `${hh}時間` : `${hh}時間${mm}分`
}

export default function ShiftModal({ date, shifts, onAdd, onDelete, onClose }: Props) {
  const { jobs } = useJobs()
  const { shifts: allShifts } = useShifts()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  // 過去のシフトから重複を除いた最近のパターンを抽出
  const recentPatterns = useMemo(() => {
    const seen = new Set<string>()
    const patterns: Array<{ jobName: string; startTime: string; endTime: string; wage: number }> = []
    const sorted = [...allShifts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    for (const s of sorted) {
      const key = `${s.jobName}|${s.startTime}|${s.endTime}`
      if (!seen.has(key)) {
        seen.add(key)
        patterns.push({ jobName: s.jobName, startTime: s.startTime, endTime: s.endTime, wage: s.wage })
        if (patterns.length >= 5) break
      }
    }
    return patterns
  }, [allShifts])

  const applyPattern = (p: typeof recentPatterns[0]) => {
    const job = jobs.find((j) => j.name === p.jobName) ?? { id: '', name: p.jobName, wage: p.wage }
    setSelectedJob(job as Job)
    setStartTime(p.startTime)
    setEndTime(p.endTime)
  }

  const preview = selectedJob
    ? calcEarnings(startTime, endTime, selectedJob.wage)
    : { regularHours: 0, nightHours: 0, total: 0 }

  const hasPreview = selectedJob && startTime && endTime

  const handleAdd = () => {
    if (!selectedJob || !startTime || !endTime) return
    onAdd(startTime, endTime, selectedJob.wage, selectedJob.name)
    setStartTime('')
    setEndTime('')
    setSelectedJob(null)
  }

  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })

  const dayTotal = shifts.reduce(
    (sum, s) => sum + calcEarnings(s.startTime, s.endTime, s.wage).total,
    0
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full" />

        {/* ヘッダー */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{dateLabel}</h3>
            {dayTotal > 0 && (
              <p className="text-sm text-green-600 font-medium">合計 {fmt(dayTotal)}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center">
            ×
          </button>
        </div>

        {/* 登録済みシフト */}
        {shifts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">登録済み</p>
            {shifts.map((s) => {
              const e = calcEarnings(s.startTime, s.endTime, s.wage)
              return (
                <div key={s.id} className="bg-green-50 rounded-xl px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {s.jobName && <span className="text-gray-500 mr-1">{s.jobName}</span>}
                        {s.startTime} 〜 {s.endTime}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        ¥{s.wage.toLocaleString()}/h
                        {e.nightHours > 0 && (
                          <span className="ml-2 text-purple-500">深夜{fmtH(e.nightHours)}含む</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-green-600">{fmt(e.total)}</p>
                      <button onClick={() => onDelete(s.id)} className="text-gray-300 hover:text-red-400 text-xl transition-colors">×</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* よく使うシフト */}
        {recentPatterns.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">よく使うシフト</p>
            <div className="flex flex-col gap-2">
              {recentPatterns.map((p, i) => {
                const e = calcEarnings(p.startTime, p.endTime, p.wage)
                const isSelected =
                  selectedJob?.name === p.jobName &&
                  startTime === p.startTime &&
                  endTime === p.endTime
                return (
                  <button
                    key={i}
                    onClick={() => applyPattern(p)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? 'text-orange-600' : 'text-gray-700'}`}>
                        {p.jobName}
                      </p>
                      <p className={`text-xs mt-0.5 ${isSelected ? 'text-orange-400' : 'text-gray-400'}`}>
                        {p.startTime} 〜 {p.endTime}・¥{p.wage.toLocaleString()}/h
                      </p>
                    </div>
                    <p className={`text-sm font-bold ${isSelected ? 'text-orange-500' : 'text-gray-500'}`}>
                      {fmt(e.total)}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 新規入力フォーム */}
        <div className="space-y-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            {recentPatterns.length > 0 ? '手動で入力' : 'シフトを追加'}
          </p>

          {/* バイト選択 */}
          {jobs.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-400">バイトが登録されていません</p>
              <p className="text-xs text-gray-300 mt-1">「バイト」タブから先に登録してください</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                    selectedJob?.id === job.id
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className={`font-medium text-sm ${selectedJob?.id === job.id ? 'text-orange-600' : 'text-gray-700'}`}>
                    {job.name}
                  </span>
                  <span className={`text-sm ${selectedJob?.id === job.id ? 'text-orange-500' : 'text-gray-400'}`}>
                    ¥{job.wage.toLocaleString()}/h
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 時刻入力 */}
          {selectedJob && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">開始時刻</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">終了時刻</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>
          )}

          {/* プレビュー */}
          {hasPreview && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">通常時間（{fmtH(preview.regularHours)}）</span>
                <span className="text-gray-700">{fmt(preview.regularHours * selectedJob.wage)}</span>
              </div>
              {preview.nightHours > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-purple-500">深夜時間（{fmtH(preview.nightHours)}）×1.25</span>
                  <span className="text-purple-600">{fmt(preview.nightHours * selectedJob.wage * 1.25)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-bold text-gray-700">合計</span>
                <span className="font-bold text-gray-900 text-base">{fmt(preview.total)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!selectedJob || !startTime || !endTime}
            className="w-full bg-orange-400 hover:bg-orange-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-colors"
          >
            追加する
          </button>
        </div>
      </div>
    </div>
  )
}
