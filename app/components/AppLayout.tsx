'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-800">Fuwallet 🍙</h1>
        <p className="text-xs text-gray-400 mt-0.5">バイト大学生の扶養管理アプリ</p>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 pb-24">
        {children}
      </main>

      <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-md mx-auto flex">
          <Link href="/" className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${pathname === '/' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}>
            <span className="text-2xl">🏠</span>
            <span className="text-xs font-medium">ホーム</span>
          </Link>
          <Link href="/calendar" className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${pathname === '/calendar' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}>
            <span className="text-2xl">📅</span>
            <span className="text-xs font-medium">カレンダー</span>
          </Link>
          <Link href="/shift-request" className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${pathname === '/shift-request' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}>
            <span className="text-2xl">📋</span>
            <span className="text-xs font-medium">希望表</span>
          </Link>
          <Link href="/jobs" className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${pathname === '/jobs' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}>
            <span className="text-2xl">💼</span>
            <span className="text-xs font-medium">バイト</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
