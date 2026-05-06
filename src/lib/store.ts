import { Task, TeamMember, DEFAULT_MEMBERS } from '@/types'

const TASKS_KEY = 'team-tasks:tasks'
const MEMBERS_KEY = 'team-tasks:members'

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

const SAMPLE_TASKS: Task[] = [
  {
    id: generateId(),
    title: '메인 화면 UI 디자인 검토',
    description: '피그마 시안을 바탕으로 메인 화면 컴포넌트 구현 방향 논의',
    status: 'todo',
    priority: 'high',
    assigneeId: 'm1',
    dueDate: '2026-05-10',
    createdAt: new Date().toISOString(),
    tags: ['디자인', '프론트엔드'],
  },
  {
    id: generateId(),
    title: 'API 인증 토큰 갱신 로직 구현',
    description: 'JWT refresh token 만료 시 자동 갱신 처리',
    status: 'in-progress',
    priority: 'urgent',
    assigneeId: 'm2',
    dueDate: '2026-05-08',
    createdAt: new Date().toISOString(),
    tags: ['백엔드', 'API'],
  },
  {
    id: generateId(),
    title: '사용자 온보딩 플로우 기획',
    description: '신규 사용자 첫 접속 시 튜토리얼 및 안내 흐름 설계',
    status: 'review',
    priority: 'medium',
    assigneeId: 'm3',
    dueDate: '2026-05-12',
    createdAt: new Date().toISOString(),
    tags: ['기획'],
  },
  {
    id: generateId(),
    title: '단위 테스트 커버리지 80% 달성',
    description: '핵심 비즈니스 로직 테스트 코드 작성',
    status: 'done',
    priority: 'medium',
    assigneeId: 'm4',
    dueDate: '2026-05-05',
    createdAt: new Date().toISOString(),
    tags: ['테스트'],
  },
  {
    id: generateId(),
    title: '모바일 반응형 레이아웃 수정',
    description: '480px 이하 해상도에서 카드 레이아웃 깨짐 수정',
    status: 'todo',
    priority: 'low',
    assigneeId: 'm5',
    dueDate: '2026-05-15',
    createdAt: new Date().toISOString(),
    tags: ['프론트엔드'],
  },
  {
    id: generateId(),
    title: 'DB 인덱스 최적화',
    description: '슬로우 쿼리 분석 후 복합 인덱스 추가',
    status: 'in-progress',
    priority: 'high',
    assigneeId: 'm1',
    dueDate: '2026-05-09',
    createdAt: new Date().toISOString(),
    tags: ['백엔드', 'DB'],
  },
]

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (!raw) {
      const sample = SAMPLE_TASKS
      localStorage.setItem(TASKS_KEY, JSON.stringify(sample))
      return sample
    }
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

export function loadMembers(): TeamMember[] {
  if (typeof window === 'undefined') return DEFAULT_MEMBERS
  try {
    const raw = localStorage.getItem(MEMBERS_KEY)
    if (!raw) return DEFAULT_MEMBERS
    return JSON.parse(raw)
  } catch {
    return DEFAULT_MEMBERS
  }
}

export function saveMembers(members: TeamMember[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
}

export function createTask(data: Omit<Task, 'id' | 'createdAt'>): Task {
  return {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
}
