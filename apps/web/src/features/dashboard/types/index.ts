export interface GoalProgress {
  target: number
  current: number
  percent: number
}

export interface CurrentBook {
  id: string
  title: string
  author: string
  cover_url?: string | null
  total_pages?: number | null
  current_page: number
}

export interface DashboardGoals {
  books: GoalProgress
  pages: GoalProgress
  minutes: GoalProgress
}

export interface DashboardSummary {
  year: number
  completed_books_total: number
  completed_books_year: number
  pages_read: number
  minutes_read: number
  current_streak: number
  current_book?: CurrentBook | null
  goals: DashboardGoals
}

export interface HeatmapDay {
  date: string
  count: number
}

export interface HeatmapResponse {
  year: number
  days: HeatmapDay[]
}
