import { Component } from '@angular/core';
import { tap } from 'rxjs';
import { AuthService } from '../auth.service';
import { CartService } from '../../../../services/cart.service';
import { FormValidationService } from '../../../../shared/services/form-validation.service';
import { CommonConstants } from '../../../../shared/constant/common-constant';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [AuthService]
})
export class LoginComponent {
  public loginForm!: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
  private authService: AuthService,
  private cartService: CartService,
    public formValidator: FormValidationService,
    
  ) { }


  ngOnInit(): void {
    this.buildForm();
  }

  submitForm() {
    const setNewPassword = this.authService.login(this.loginForm.value).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('authToken', res.token)
          // If API returns user id, use it to persist cart server-side
          const userId = res.user?._id || res.user?.id || res.userId || null;
          if (userId) {
            // Migrate guest cart (if present) into user's server cart
            // Fetch guest cart (cookie-based) and then bulk replace user's cart
            // Use HttpClient from cartService by calling its replaceServerCart after loading guest items
            this.cartService.loadGuestCartAndMerge(userId).subscribe({
              next: _ => {
                // finally set the userId so CartService loads the user's cart
                this.cartService.setUserId(userId);
              },
              error: _ => {
                // even if merge fails, set user id to continue
                this.cartService.setUserId(userId);
              }
            });
          }
        }
      }),
    ).subscribe()

  }

  public buildForm() {
    this.loginForm = this.formBuilder.group({
      email: ["", Validators.compose([Validators.required, Validators.pattern(CommonConstants.REGEX_PATTERN.emailPattern),])],
      password: ["", Validators.compose([Validators.required])],
    });
  }

  public navigateToforgetPassword() {
    this.router.navigate(['/register'], { queryParams: { forgetPassword:true }  });
  }
}
