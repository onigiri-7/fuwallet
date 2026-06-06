'use client'

import { useState } from 'react'
import { useJobs } from './useJobs'

export default function JobsView() {
  const { jobs, addJob, deleteJob, mounted } = useJobs()
  const [name, setName] = useState('')
  const [wage, setWage] = useState('')
  const [showForm, setShowForm] = useState(false)

  if (!mounted) return null

  const handleAdd = () => {
    if (!name.trim() || !wage) return
    addJob(name.trim(), parseInt(wage))
    setName('')
    setWage('')
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      {/* 登録済みバイト一覧 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <p className="text-sm font-medium text-gray-700 mb-3">登録済みのバイト</p>

        {jobs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            まだバイトが登録されていません
          </p>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-800">{job.name}</p>
                  <p className="text-sm text-gray-400">¥{job.wage.toLocaleString()} / 時間</p>
                </div>
                <button
                  onClick={() => deleteJob(job.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-sm border border-gray-200 hover:border-red-300 px-3 py-1 rounded-lg"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 追加ボタン */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 rounded-2xl transition-colors"
      >
        {showForm ? '✕ 閉じる' : '＋ バイトを追加'}
      </button>

      {/* 追加フォーム */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <p className="font-medium text-gray-700">バイト情報を入力</p>
          <div>
            <label className="text-xs text-gray-500">バイト名・職場名</label>
            <input
              type="text"
              placeholder="例: レストランA、コンビニB"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">時給（円）</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="例: 1050"
              value={wage}
              onChange={(e) => setWage(e.target.value)}
              className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!name.trim() || !wage}
            className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-2.5 rounded-xl transition-colors"
          >
            登録する
          </button>
        </div>
      )}
    </div>
  )
}
