import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

const CHUNK_SIZE = 3180

/**
 * localhost:3000 이 응답하는지 확인한다.
 * 못 닿으면 친절한 안내와 함께 throw.
 */
export async function waitForDevServer(url = 'http://localhost:3000'): Promise<void> {
  try {
    await fetch(url, { signal: AbortSignal.timeout(5_000) })
  } catch {
    throw new Error(
      `Dev 서버(${url})에 접근할 수 없습니다.\n별도 터미널에서 npm run dev 먼저 띄우세요.`,
    )
  }
}

/**
 * TEST_USER_EMAIL / TEST_USER_PASSWORD 로 Supabase 로그인 후
 * @supabase/ssr 이 기대하는 쿠키 헤더 문자열과 userId 를 반환한다.
 *
 * @supabase/ssr 은 sb-{projectRef}-auth-token 쿠키에 JSON.stringify(session) 을
 * URL 인코딩해 저장한다. 3180자 초과 시 .0 .1 … 으로 청킹.
 */
export async function signInTestUser(): Promise<{ cookieHeader: string; userId: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const email = process.env.TEST_USER_EMAIL!
  const password = process.env.TEST_USER_PASSWORD!

  const supabase = createClient(supabaseUrl, anonKey)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    throw new Error(`Supabase 로그인 실패: ${error?.message ?? 'session 없음'}`)
  }

  const { session } = data
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
  const cookieName = `sb-${projectRef}-auth-token`
  const sessionStr = JSON.stringify(session)

  let cookieParts: string[]
  if (sessionStr.length <= CHUNK_SIZE) {
    cookieParts = [`${cookieName}=${encodeURIComponent(sessionStr)}`]
  } else {
    cookieParts = []
    for (let i = 0; i * CHUNK_SIZE < sessionStr.length; i++) {
      const chunk = sessionStr.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
      cookieParts.push(`${cookieName}.${i}=${encodeURIComponent(chunk)}`)
    }
  }

  return {
    cookieHeader: cookieParts.join('; '),
    userId: session.user.id,
  }
}

/**
 * SERVICE_ROLE_KEY 로 RLS 를 우회하는 어드민 클라이언트 반환.
 * 통합 테스트의 beforeEach / afterEach cleanup 용도.
 */
export function getAdminSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
