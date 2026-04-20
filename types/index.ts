export type UserRole = 'subscriber' | 'admin'
export type SubscriptionStatus = 'active' | 'inactive' | 'lapsed' | 'cancelled'
export type DrawStatus = 'pending' | 'simulated' | 'published'
export type MatchType = '5-match' | '4-match' | '3-match'
export type PaymentStatus = 'pending' | 'paid' | 'rejected'
export type VerificationStatus = 'unverified' | 'approved' | 'rejected'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  charity_id: string | null
  charity_percentage: number
  subscription_status: SubscriptionStatus
  subscription_plan: 'monthly' | 'yearly' | null
  subscription_end_date: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
}

export interface Score {
  id: string
  user_id: string
  score: number
  score_date: string
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string
  image_url: string
  website_url: string
  is_featured: boolean
  is_active: boolean
  total_received: number
}

export interface Draw {
  id: string
  month: number
  year: number
  draw_type: 'random' | 'algorithmic'
  drawn_numbers: number[] | null
  status: DrawStatus
  prize_pool_total: number
  jackpot_pool: number
  jackpot_rollover: number
  created_at: string
  published_at: string | null
}

export interface DrawResult {
  id: string
  draw_id: string
  user_id: string
  match_type: MatchType
  matched_numbers: number[]
  prize_amount: number
  payment_status: PaymentStatus
  proof_url: string | null
  verification_status: VerificationStatus
  created_at: string
}