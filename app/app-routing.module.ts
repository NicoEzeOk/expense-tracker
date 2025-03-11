import { NgModule } from "@angular/core"
import { PreloadAllModules, RouterModule, type Routes } from "@angular/router"

const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "login",
    loadChildren: () => import("./login/login.module").then((m) => m.LoginPageModule),
  },
  {
    path: "dashboard",
    loadChildren: () => import("./dashboard/dashboard.module").then((m) => m.DashboardPageModule),
  },
  {
    path: "transactions",
    loadChildren: () => import("./transactions/transactions.module").then((m) => m.TransactionsPageModule),
  },
  {
    path: "add-transaction",
    loadChildren: () => import("./add-transaction/add-transaction.module").then((m) => m.AddTransactionPageModule),
  },
  {
    path: "edit-transaction/:id",
    loadChildren: () => import("./edit-transaction/edit-transaction.module").then((m) => m.EditTransactionPageModule),
  },
  {
    path: "profile",
    loadChildren: () => import("./profile/profile.module").then((m) => m.ProfilePageModule),
  },
  {
    path: "categories",
    loadChildren: () => import("./categories/categories.module").then((m) => m.CategoriesPageModule),
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

// Add default export for deployment compatibility
export default AppRoutingModule

