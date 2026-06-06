'use client'

import { useState, useEffect } from 'react'

export interface Job {
  id: string
  name: string
  wage: number
}

const KEY = 'fuwallet_jobs'

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(KEY)
    if (saved) setJobs(JSON.parse(saved))
  }, [])

  const save = (next: Job[]) => {
    setJobs(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }

  const addJob = (name: string, wage: number) => {
    save([...jobs, { id: Date.now().toString(), name, wage }])
  }

  const deleteJob = (id: string) => {
    save(jobs.filter((j) => j.id !== id))
  }

  return { jobs, addJob, deleteJob, mounted }
}
