import { Component } from "@angular/core"
import type { SupabaseService } from "./supabase.service"
import type { Router } from "@angular/router"

@Component({
  selector: "app-root",
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
})
export class AppComponent {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
  ) {
    this.supabaseService.authChanges((_, session) => {
      if (session?.user) {
        this.router.navigate(["/dashboard"])
      } else {
        this.router.navigate(["/login"])
      }
    })
  }
}

// Add default export for deployment compatibility
export default AppComponent

