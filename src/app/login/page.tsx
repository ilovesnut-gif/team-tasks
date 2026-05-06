'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  async function handleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <button
        onClick={handleLogin}
        className="rounded-lg border px-6 py-3 text-sm font-medium shadow-sm hover:bg-accent"
      >
        Google로 로그인
      </button>
    </main>
  )
}
