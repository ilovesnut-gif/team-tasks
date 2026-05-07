'use client'

import { useRouter } from 'next/navigation'
import { Task, TeamMember, PRIORITIES } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  task: Task
  members: TeamMember[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, direction: 'forward' | 'back') => void
}

export default function TaskCard({ task, members, onEdit, onDelete, onStatusChange }: Props) {
  const router = useRouter()
  const assignee = members.find(m => m.id === task.assigneeId)
  const priority = PRIORITIES.find(p => p.value === task.priority)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = task.dueDate ? new Date(task.dueDate) : null
  const isOverdue = due && due < today && task.status !== 'done'
  const isDueSoon = due && !isOverdue && (due.getTime() - today.getTime()) <= 2 * 86400000

  return (
    <Card
      className="group cursor-pointer hover:shadow-md transition-all border-l-4"
      style={{ borderLeftColor: priority ? getPriorityColor(task.priority) : '#e2e8f0' }}
      onClick={() => onEdit(task)}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">{task.title}</p>
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={e => e.stopPropagation()}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 shrink-0 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              ···
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'forward')}>
                다음 단계로
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'back')}>
                이전 단계로
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}`)}>댓글 보기</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(task)}>수정</DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(task.id)}
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {priority && (
              <Badge variant="outline" className={`text-xs px-1.5 py-0 ${priority.color} border-0`}>
                {priority.label}
              </Badge>
            )}
            {due && (
              <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-orange-500' : 'text-muted-foreground'}`}>
                {isOverdue ? '⚠ ' : ''}{task.dueDate}
              </span>
            )}
          </div>
          {assignee && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className={`${assignee.color} text-white text-xs`}>
                {assignee.initials}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent': return '#ef4444'
    case 'high': return '#f97316'
    case 'medium': return '#3b82f6'
    default: return '#94a3b8'
  }
}
