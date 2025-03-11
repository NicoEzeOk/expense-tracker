import { Component, type OnInit } from "@angular/core"
import type { SupabaseService, Transaction } from "../supabase.service"
import type { Router } from "@angular/router"
import type { AlertController } from "@ionic/angular"

@Component({
  selector: "app-transactions",
  templateUrl: "./transactions.page.html",
  styleUrls: ["./transactions.page.scss"],
})
export class TransactionsPage implements OnInit {
  transactions: Transaction[] = []
  filteredTransactions: Transaction[] = []
  categories: any[] = []

  // Filters
  startDate: string
  endDate: string
  selectedType = ""
  selectedCategory = ""
  minAmount: number
  maxAmount: number
  searchTerm = ""

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private alertController: AlertController,
  ) {
    // Set default date range to current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    this.startDate = firstDay.toISOString().split("T")[0]
    this.endDate = lastDay.toISOString().split("T")[0]
  }

  async ngOnInit() {
    await this.loadCategories()
    await this.loadTransactions()
  }

  async loadCategories() {
    try {
      const { data, error } = await this.supabaseService.getCategories()
      if (error) throw error
      this.categories = data || []
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  async loadTransactions() {
    try {
      const loader = await this.supabaseService.createLoader()
      await loader.present()

      const { data, error } = await this.supabaseService.getTransactions({
        startDate: this.startDate,
        endDate: this.endDate,
        type: this.selectedType,
        category: this.selectedCategory,
        minAmount: this.minAmount,
        maxAmount: this.maxAmount,
      })

      if (error) throw error

      this.transactions = data || []
      this.applySearchFilter()

      loader.dismiss()
    } catch (error) {
      console.error("Error loading transactions:", error)
    }
  }

  applySearchFilter() {
    if (!this.searchTerm) {
      this.filteredTransactions = [...this.transactions]
      return
    }

    const search = this.searchTerm.toLowerCase()
    this.filteredTransactions = this.transactions.filter(
      (t) => t.description.toLowerCase().includes(search) || t.category.toLowerCase().includes(search),
    )
  }

  applyFilters() {
    this.loadTransactions()
  }

  resetFilters() {
    // Reset to current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    this.startDate = firstDay.toISOString().split("T")[0]
    this.endDate = lastDay.toISOString().split("T")[0]
    this.selectedType = ""
    this.selectedCategory = ""
    this.minAmount = null
    this.maxAmount = null
    this.searchTerm = ""

    this.loadTransactions()
  }

  goToAddTransaction() {
    this.router.navigate(["/add-transaction"])
  }

  goToEditTransaction(id: string) {
    this.router.navigate(["/edit-transaction", id])
  }

  async deleteTransaction(id: string) {
    const alert = await this.alertController.create({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this transaction?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Delete",
          handler: async () => {
            const loader = await this.supabaseService.createLoader()
            await loader.present()

            try {
              const { error } = await this.supabaseService.deleteTransaction(id)
              if (error) throw error

              this.supabaseService.createNotice("Transaction deleted successfully")
              this.loadTransactions()
            } catch (error) {
              console.error("Error deleting transaction:", error)
              this.supabaseService.createNotice("Error deleting transaction")
            } finally {
              loader.dismiss()
            }
          },
        },
      ],
    })

    await alert.present()
  }
}

// Add default export for deployment compatibility
export default TransactionsPage

