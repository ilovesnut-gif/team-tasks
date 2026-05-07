import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('task_id', id)
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { body } = await request.json()
  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return NextResponse.json({ error: 'body is required' }, { status: 400 })
  }
  if (body.length > 1000) {
    return NextResponse.json({ error: 'body must be 1000 characters or fewer' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({ task_id: id, body: body.trim(), created_by: user.id })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
