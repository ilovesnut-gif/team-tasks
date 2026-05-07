import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CommentThread from '@/components/CommentThread'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: task, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !task) notFound()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Link href="/">
          <Button variant="outline" size="sm">← 보드로</Button>
        </Link>

        <div className="rounded-xl border bg-card p-5 space-y-2">
          <div className="flex items-start gap-3">
            <h1 className="text-lg font-semibold flex-1">{task.title}</h1>
            <Badge variant="outline">{task.status === 'todo' ? '할 일' : '완료'}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(task.created_at).toLocaleDateString('ko-KR')} 생성
          </p>
        </div>

        <CommentThread taskId={id} currentUserId={user.id} />
      </div>
    </div>
  )
}
