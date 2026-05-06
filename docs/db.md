# DB 설계 — team-tasks

```sql
create table tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) <= 200),
  assignee_id uuid references auth.users(id),
  created_by  uuid not null references auth.users(id),
  status      text not null default 'todo' check (status in ('todo', 'done')),
  created_at  timestamptz not null default now()
);
```
