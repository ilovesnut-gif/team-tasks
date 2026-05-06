export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Status = 'todo' | 'in-progress' | 'review' | 'done'

export interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  assigneeId: string | null
  dueDate: string | null
  createdAt: string
  tags: string[]
}

export interface TeamMember {
  id: string
  name: string
  color: string
  initials: string
}

export const STATUSES: { value: Status; label: string }[] = [
  { value: 'todo', label: '할 일' },
  { value: 'in-progress', label: '진행 중' },
  { value: 'review', label: '검토 중' },
  { value: 'done', label: '완료' },
]

export const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: '낮음', color: 'bg-slate-100 text-slate-600' },
  { value: 'medium', label: '보통', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: '높음', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: '긴급', color: 'bg-red-100 text-red-700' },
]

export const DEFAULT_MEMBERS: TeamMember[] = [
  { id: 'm1', name: '김민준', color: 'bg-violet-500', initials: '김' },
  { id: 'm2', name: '이서연', color: 'bg-pink-500', initials: '이' },
  { id: 'm3', name: '박지호', color: 'bg-sky-500', initials: '박' },
  { id: 'm4', name: '최유진', color: 'bg-emerald-500', initials: '최' },
  { id: 'm5', name: '정하은', color: 'bg-amber-500', initials: '정' },
]
