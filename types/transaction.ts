export interface NewTransaction {
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  icon: string
}

export interface Transaction extends NewTransaction {
  id: string
  user_id: string
  created_at?: string
  updated_at?: string
} 