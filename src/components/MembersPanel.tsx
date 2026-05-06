'use client'

import { useState } from 'react'
import { TeamMember } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const COLORS = [
  'bg-violet-500', 'bg-pink-500', 'bg-sky-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-teal-500', 'bg-indigo-500',
]

interface Props {
  members: TeamMember[]
  onUpdate: (members: TeamMember[]) => void
}

export default function MembersPanel({ members, onUpdate }: Props) {
  const [newName, setNewName] = useState('')

  function addMember() {
    const name = newName.trim()
    if (!name) return
    const member: TeamMember = {
      id: Math.random().toString(36).slice(2),
      name,
      initials: name.charAt(0),
      color: COLORS[members.length % COLORS.length],
    }
    onUpdate([...members, member])
    setNewName('')
  }

  function removeMember(id: string) {
    onUpdate(members.filter(m => m.id !== id))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">팀원 관리</h3>
      <div className="space-y-2">
        {members.map(m => (
          <div key={m.id} className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className={`${m.color} text-white text-xs`}>
                {m.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm flex-1">{m.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
              onClick={() => removeMember(m.id)}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="팀원 이름"
          className="h-8 text-sm"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addMember()}
        />
        <Button size="sm" className="h-8" onClick={addMember}>추가</Button>
      </div>
    </div>
  )
}
