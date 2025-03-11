import { Component, type OnInit } from "@angular/core"
import { type FormBuilder, FormGroup, Validators } from "@angular/forms"
import type { SupabaseService } from "../supabase.service"
import type { Router } from "@angular/router"

@Component({
  selector: "app-add-transaction",
  templateUrl: "./add-transaction.page.html",
  styleUrls: ["./add-transaction.page.scss"],
})
export class AddTransactionPage implements OnInit {
  transactionForm: FormGroup
  categories: any[] = []
  loading = false

  constructor(
    private formBuilder: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
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
    await this.loadCategories()
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

  async saveTransaction() {
    if (this.transactionForm.valid) {
      this.loading = true
      const loader = await this.supabaseService.createLoader()
      await loader.present()

      try {
        const transaction = this.transactionForm.value
        const { error } = await this.supabaseService.addTransaction(transaction)

        if (error) throw error

        this.supabaseService.createNotice("Transaction added successfully")
        this.router.navigate(["/transactions"])
      } catch (error) {
        console.error("Error adding transaction:", error)
        this.supabaseService.createNotice("Error adding transaction")
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
export default AddTransactionPage

