-- assignee_id, created_by 컬럼 추가 (이미 존재하면 무시)
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by  uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 인증 없이 생성된 row 제거
DELETE FROM tasks WHERE created_by IS NULL;

-- created_by NOT NULL 강화
ALTER TABLE tasks ALTER COLUMN created_by SET NOT NULL;

-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 임시 전체 허용 정책 제거
DROP POLICY IF EXISTS temp_all_access ON tasks;

-- 본인이 생성했거나 본인에게 배정된 일감만 조회
CREATE POLICY tasks_select ON tasks
  FOR SELECT USING (
    auth.uid() = created_by OR auth.uid() = assignee_id
  );

-- created_by가 본인일 때만 삽입
CREATE POLICY tasks_insert ON tasks
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- 생성자 또는 담당자만 수정
CREATE POLICY tasks_update ON tasks
  FOR UPDATE USING (
    auth.uid() = created_by OR auth.uid() = assignee_id
  );

-- 생성자만 삭제
CREATE POLICY tasks_delete ON tasks
  FOR DELETE USING (auth.uid() = created_by);
