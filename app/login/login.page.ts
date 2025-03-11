import { Component } from "@angular/core"
import { type FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type { Router } from "@angular/router"
import type { SupabaseService } from "../supabase.service"

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage {
  loginForm: FormGroup
  registerForm: FormGroup
  isLogin = true
  loading = false

  constructor(
    private formBuilder: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })

    this.registerForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", [Validators.required]],
      username: ["", [Validators.required]],
    })
  }

  async login() {
    if (this.loginForm.valid) {
      this.loading = true
      const loader = await this.supabaseService.createLoader()
      await loader.present()

      try {
        const { email, password } = this.loginForm.value
        const { error } = await this.supabaseService.signIn(email, password)

        if (error) throw error

        this.router.navigate(["/dashboard"])
      } catch (error: any) {
        this.supabaseService.createNotice(error.message)
      } finally {
        this.loading = false
        loader.dismiss()
      }
    }
  }

  async register() {
    if (this.registerForm.valid) {
      this.loading = true
      const loader = await this.supabaseService.createLoader()
      await loader.present()

      try {
        const { email, password, username } = this.registerForm.value
        const { error: signUpError, data } = await this.supabaseService.signUp(email, password)

        if (signUpError) throw signUpError

        if (data?.user) {
          await this.supabaseService.updateProfile({
            id: data.user.id,
            username,
            email,
            avatar_url: "",
          })
        }

        this.supabaseService.createNotice("Registration successful! Please check your email to confirm your account.")
        this.toggleForm()
      } catch (error: any) {
        this.supabaseService.createNotice(error.message)
      } finally {
        this.loading = false
        loader.dismiss()
      }
    }
  }

  async loginWithGoogle() {
    this.loading = true
    const loader = await this.supabaseService.createLoader()
    await loader.present()

    try {
      const { error } = await this.supabaseService.signInWithGoogle()
      if (error) throw error
    } catch (error: any) {
      this.supabaseService.createNotice(error.message)
    } finally {
      this.loading = false
      loader.dismiss()
    }
  }

  toggleForm() {
    this.isLogin = !this.isLogin
  }
}

// Add default export for deployment compatibility
export default LoginPage

