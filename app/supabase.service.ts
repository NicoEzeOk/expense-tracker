import { Injectable } from "@angular/core"
import type { LoadingController, ToastController } from "@ionic/angular"
import { type AuthChangeEvent, createClient, type Session, type SupabaseClient } from "@supabase/supabase-js"
import { environment } from "../environments/environment"

export interface Profile {
  id?: string
  username: string
  email: string
  avatar_url: string
}

export interface Transaction {
  id?: string
  user_id: string
  amount: number
  type: "income" | "expense"
  category: string
  description: string
  date: string
}

export interface Category {
  id?: string
  user_id: string
  name: string
  type: "income" | "expense"
  icon: string
  color: string
}

@Injectable({
  providedIn: "root",
})
export class SupabaseService {
  private supabase: SupabaseClient

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
  ) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
  }

  get user() {
    return this.supabase.auth.getUser().then(({ data }) => data?.user)
  }

  get session() {
    return this.supabase.auth.getSession().then(({ data }) => data?.session)
  }

  get profile() {
    return this.user
      .then((user) => user?.id)
      .then((id) => this.supabase.from("profiles").select(`username, email, avatar_url`).eq("id", id).single())
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password })
  }

  signInWithGoogle() {
    return this.supabase.auth.signInWithOAuth({
      provider: "google",
    })
  }

  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password })
  }

  signOut() {
    return this.supabase.auth.signOut()
  }

  async updateProfile(profile: Profile) {
    const user = await this.user
    const update = {
      ...profile,
      id: user?.id,
      updated_at: new Date(),
    }

    return this.supabase.from("profiles").upsert(update)
  }

  async getTransactions(filters: any = {}) {
    const user = await this.user
    let query = this.supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user?.id)
      .order("date", { ascending: false })

    if (filters.startDate && filters.endDate) {
      query = query.gte("date", filters.startDate).lte("date", filters.endDate)
    }

    if (filters.type) {
      query = query.eq("type", filters.type)
    }

    if (filters.category) {
      query = query.eq("category", filters.category)
    }

    if (filters.minAmount) {
      query = query.gte("amount", filters.minAmount)
    }

    if (filters.maxAmount) {
      query = query.lte("amount", filters.maxAmount)
    }

    return query
  }

  async addTransaction(transaction: Transaction) {
    const user = await this.user
    const newTransaction = {
      ...transaction,
      user_id: user?.id,
      created_at: new Date(),
    }

    return this.supabase.from("transactions").insert(newTransaction)
  }

  async updateTransaction(transaction: Transaction) {
    return this.supabase.from("transactions").update(transaction).eq("id", transaction.id)
  }

  async deleteTransaction(id: string) {
    return this.supabase.from("transactions").delete().eq("id", id)
  }

  async getCategories() {
    const user = await this.user
    return this.supabase.from("categories").select("*").or(`user_id.eq.${user?.id},user_id.is.null`).order("name")
  }

  async addCategory(category: Category) {
    const user = await this.user
    const newCategory = {
      ...category,
      user_id: user?.id,
      created_at: new Date(),
    }

    return this.supabase.from("categories").insert(newCategory)
  }

  async updateCategory(category: Category) {
    return this.supabase.from("categories").update(category).eq("id", category.id)
  }

  async deleteCategory(id: string) {
    return this.supabase.from("categories").delete().eq("id", id)
  }

  async createNotice(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 5000 })
    await toast.present()
  }

  createLoader() {
    return this.loadingCtrl.create()
  }

  downloadImage(path: string) {
    return this.supabase.storage.from("avatars").download(path)
  }

  uploadAvatar(filePath: string, file: File) {
    return this.supabase.storage.from("avatars").upload(filePath, file)
  }

  exportData(format: "csv" | "excel" | "pdf") {
    // Implementation for exporting data would go here
    // This would typically involve fetching all transactions and formatting them
    // for the requested export type
  }
}

// Add default export for deployment compatibility
export default SupabaseService

