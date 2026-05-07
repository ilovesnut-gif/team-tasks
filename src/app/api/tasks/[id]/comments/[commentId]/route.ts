import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string; commentId: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id, commentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('created_by')
    .eq('id', commentId)
    .eq('task_id', id)
    .single()
  if (fetchError) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (comment.created_by !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { body } = await request.json()
  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return NextResponse.json({ error: 'body is required' }, { status: 400 })
  }
  if (body.length > 1000) {
    return NextResponse.json({ error: 'body must be 1000 characters or fewer' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comments')
    .update({ body: body.trim() })
    .eq('id', commentId)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id, commentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('created_by')
    .eq('id', commentId)
    .eq('task_id', id)
    .single()
  if (fetchError) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (comment.created_by !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}
