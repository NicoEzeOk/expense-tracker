import { Component, type OnInit, ViewChild, type ElementRef } from "@angular/core"
import type { SupabaseService, Transaction } from "../supabase.service"
import { Chart } from "chart.js/auto"
import type { Router } from "@angular/router"

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.page.html",
  styleUrls: ["./dashboard.page.scss"],
})
export class DashboardPage implements OnInit {
  @ViewChild("incomeExpenseChart") incomeExpenseChart: ElementRef
  @ViewChild("categoryChart") categoryChart: ElementRef

  transactions: Transaction[] = []
  profile: any = null
  totalIncome = 0
  totalExpense = 0
  balance = 0

  // Date filters
  dateFilter = "month"
  startDate: string
  endDate: string

  // Charts
  incomeExpenseChartInstance: Chart
  categoryChartInstance: Chart

  // Dark mode
  darkMode = false

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
  ) {
    // Set default date range to current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    this.startDate = firstDay.toISOString().split("T")[0]
    this.endDate = lastDay.toISOString().split("T")[0]

    // Check system preference for dark mode
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")
    this.darkMode = prefersDark.matches
    this.toggleDarkTheme(this.darkMode)

    // Listen for changes to color scheme preferences
    prefersDark.addEventListener("change", (mediaQuery) => {
      this.darkMode = mediaQuery.matches
      this.toggleDarkTheme(this.darkMode)
    })
  }

  async ngOnInit() {
    await this.loadProfile()
    await this.loadTransactions()
  }

  async loadProfile() {
    try {
      const { data: profile } = await this.supabaseService.profile
      this.profile = profile
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  async loadTransactions() {
    try {
      const loader = await this.supabaseService.createLoader()
      await loader.present()

      const { data, error } = await this.supabaseService.getTransactions({
        startDate: this.startDate,
        endDate: this.endDate,
      })

      if (error) throw error

      this.transactions = data || []
      this.calculateTotals()
      this.renderCharts()

      loader.dismiss()
    } catch (error) {
      console.error("Error loading transactions:", error)
    }
  }

  calculateTotals() {
    this.totalIncome = this.transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    this.totalExpense = this.transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    this.balance = this.totalIncome - this.totalExpense
  }

  renderCharts() {
    setTimeout(() => {
      this.renderIncomeExpenseChart()
      this.renderCategoryChart()
    }, 100)
  }

  renderIncomeExpenseChart() {
    if (this.incomeExpenseChartInstance) {
      this.incomeExpenseChartInstance.destroy()
    }

    const ctx = this.incomeExpenseChart.nativeElement.getContext("2d")

    this.incomeExpenseChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Income", "Expense"],
        datasets: [
          {
            label: "Amount",
            data: [this.totalIncome, this.totalExpense],
            backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
            borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  }

  renderCategoryChart() {
    if (this.categoryChartInstance) {
      this.categoryChartInstance.destroy()
    }

    // Group expenses by category
    const categories = {}
    this.transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (!categories[t.category]) {
          categories[t.category] = 0
        }
        categories[t.category] += t.amount
      })

    const categoryLabels = Object.keys(categories)
    const categoryData = Object.values(categories)

    // Generate random colors for each category
    const backgroundColors = categoryLabels.map(
      () =>
        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
    )

    const ctx = this.categoryChart.nativeElement.getContext("2d")

    this.categoryChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: categoryLabels,
        datasets: [
          {
            label: "Expenses by Category",
            data: categoryData,
            backgroundColor: backgroundColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
      },
    })
  }

  setDateFilter(filter: string) {
    this.dateFilter = filter
    const now = new Date()

    switch (filter) {
      case "week":
        // Current week
        const firstDayOfWeek = new Date(now)
        firstDayOfWeek.setDate(now.getDate() - now.getDay())
        const lastDayOfWeek = new Date(firstDayOfWeek)
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6)

        this.startDate = firstDayOfWeek.toISOString().split("T")[0]
        this.endDate = lastDayOfWeek.toISOString().split("T")[0]
        break

      case "month":
        // Current month
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        this.startDate = firstDayOfMonth.toISOString().split("T")[0]
        this.endDate = lastDayOfMonth.toISOString().split("T")[0]
        break

      case "year":
        // Current year
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1)
        const lastDayOfYear = new Date(now.getFullYear(), 11, 31)

        this.startDate = firstDayOfYear.toISOString().split("T")[0]
        this.endDate = lastDayOfYear.toISOString().split("T")[0]
        break

      case "all":
        // All time - set to a wide range
        this.startDate = "2000-01-01"
        this.endDate = "2100-12-31"
        break
    }

    this.loadTransactions()
  }

  toggleDarkTheme(shouldAdd: boolean) {
    document.body.classList.toggle("dark", shouldAdd)
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode
    this.toggleDarkTheme(this.darkMode)

    // Redraw charts with new theme
    setTimeout(() => {
      this.renderCharts()
    }, 100)
  }

  goToTransactions() {
    this.router.navigate(["/transactions"])
  }

  goToAddTransaction() {
    this.router.navigate(["/add-transaction"])
  }

  async logout() {
    await this.supabaseService.signOut()
    this.router.navigate(["/login"])
  }

  exportData(format: "pdf" | "excel" | "csv") {
    this.supabaseService.exportData(format)
    this.supabaseService.createNotice(`Exporting data as ${format.toUpperCase()}...`)
  }
}

// Add default export for deployment compatibility
export default DashboardPage

