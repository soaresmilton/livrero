export interface ReadingGoal {
  id: string
  year: number
  books_goal: number
  pages_goal: number
  minutes_goal: number
  created_at?: string | null
  updated_at?: string | null
}

export interface UpsertGoalRequest {
  books_goal: number
  pages_goal: number
  minutes_goal: number
}

export interface GoalProgress {
  target: number
  current: number
  percent: number
}
