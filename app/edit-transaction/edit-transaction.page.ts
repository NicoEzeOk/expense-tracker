import { Component, type OnInit } from "@angular/core"
import { type FormBuilder, FormGroup, Validators } from "@angular/forms"
import type { SupabaseService, Transaction } from "../supabase.service"
import type { ActivatedRoute, Router } from "@angular/router"

@Component({
  selector: "app-edit-transaction",
  templateUrl: "./edit-transaction.page.html",
  styleUrls: ["./edit-transaction.page.scss"],
})
export class EditTransactionPage implements OnInit {
  transactionForm: FormGroup
  categories: any[] = []
  loading = false
  transactionId: string
  transaction: Transaction

  constructor(
    private formBuilder: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.transactionForm = this.formBuilder.group({
      type: ["expense", Validators.required],
      amount: ["", [Validators.required, Validators.min(0.01)]],
      category: ["", Validators.required],
      description: ["", Validators.required],
      date: [new Date().toISOString().split("T")[0], Validators.required],
    })
  }

  async ngOnInit() {
    this.transactionId = this.route.snapshot.paramMap.get("id")
    await this.loadCategories()
    await this.loadTransaction()
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

  async loadTransaction() {
    if (!this.transactionId) return

    try {
      const loader = await this.supabaseService.createLoader()
      await loader.present()

      const { data, error } = await this.supabaseService.getTransactions()

      if (error) throw error

      this.transaction = data.find((t) => t.id === this.transactionId)

      if (this.transaction) {
        this.transactionForm.patchValue({
          type: this.transaction.type,
          amount: this.transaction.amount,
          category: this.transaction.category,
          description: this.transaction.description,
          date: this.transaction.date,
        })
      }

      loader.dismiss()
    } catch (error) {
      console.error("Error loading transaction:", error)
    }
  }

  async updateTransaction() {
    if (this.transactionForm.valid) {
      this.loading = true
      const loader = await this.supabaseService.createLoader()
      await loader.present()

      try {
        const updatedTransaction = {
          ...this.transactionForm.value,
          id: this.transactionId,
          user_id: this.transaction.user_id,
        }

        const { error } = await this.supabaseService.updateTransaction(updatedTransaction)

        if (error) throw error

        this.supabaseService.createNotice("Transaction updated successfully")
        this.router.navigate(["/transactions"])
      } catch (error) {
        console.error("Error updating transaction:", error)
        this.supabaseService.createNotice("Error updating transaction")
      } finally {
        this.loading = false
        loader.dismiss()
      }
    } else {
      this.markFormGroupTouched(this.transactionForm)
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched()
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      }
    })
  }

  getFilteredCategories() {
    const type = this.transactionForm.get("type").value
    return this.categories.filter((c) => c.type === type || c.type === "both")
  }
}

// Add default export for deployment compatibility
export default EditTransactionPage

