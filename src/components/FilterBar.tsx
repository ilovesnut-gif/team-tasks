'use client'

import { TeamMember, PRIORITIES, Priority } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export interface Filters {
  search: string
  assigneeId: string | null
  priority: Priority | null
}

interface Props {
  filters: Filters
  members: TeamMember[]
  onChange: (filters: Filters) => void
}

export default function FilterBar({ filters, members, onChange }: Props) {
  const hasActive = filters.search || filters.assigneeId || filters.priority

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="제목·설명 검색…"
        className="w-52"
        value={filters.search}
        onChange={e => onChange({ ...filters, search: e.target.value })}
      />

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">담당자</span>
        {members.map(m => (
          <button
            key={m.id}
            title={m.name}
            onClick={() => onChange({ ...filters, assigneeId: filters.assigneeId === m.id ? null : m.id })}
          >
            <Avatar className={`h-7 w-7 ring-2 transition-all ${filters.assigneeId === m.id ? 'ring-foreground' : 'ring-transparent'}`}>
              <AvatarFallback className={`${m.color} text-white text-xs`}>
                {m.initials}
              </AvatarFallback>
            </Avatar>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">우선순위</span>
        {PRIORITIES.map(p => (
          <Badge
            key={p.value}
            variant="outline"
            className={`cursor-pointer text-xs transition-all ${p.color} border-0 ${filters.priority === p.value ? 'ring-2 ring-foreground' : ''}`}
            onClick={() => onChange({ ...filters, priority: filters.priority === p.value ? null : p.value })}
          >
            {p.label}
          </Badge>
        ))}
      </div>

      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground h-7"
          onClick={() => onChange({ search: '', assigneeId: null, priority: null })}
        >
          필터 초기화
        </Button>
      )}
    </div>
  )
}
