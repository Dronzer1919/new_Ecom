import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, tap } from 'rxjs';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormValidationService } from '../../../../shared/services/form-validation.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators'; // Import necessary operators

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  providers: [AuthService],
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  public registrationForm!: FormGroup;
  public forGetPassword: boolean = false;
  public isOtpVerified: boolean = false;
  public otpForm!: FormGroup;
  private subscription: Subscription[] = [];
  public resendOtp: boolean = false;

  // Email existence check feedback variables
  public emailExists: boolean = false;
  public isCheckingEmail: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    public formValidator: FormValidationService,
    public ToastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.buildregisterform();
    this.buildOTPForm();
    this.getActivatedRouteValue();
  }

  // Build the registration form
  public buildregisterform() {
    this.registrationForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    // Check email existence on email field change with debounce
    this.registrationForm.controls['email'].valueChanges.pipe(
      debounceTime(3000), // Wait for 3 seconds after user stops typing
      distinctUntilChanged(), // Prevents checking if the value hasn't changed
      switchMap(email => {
        // Only check email if it's valid
        if (this.registrationForm.controls['email'].valid) {
          this.isCheckingEmail = true;  // Show loading indication
          return this.authService.checkEmailExistence(email);
        } else {
          // Return an empty observable if email is invalid
          return [];
        }
      }),
      catchError(error => {
        this.isCheckingEmail = false;  // Stop loading indication on error
        this.ToastrService.error('An error occurred while checking email existence');
        return [];  // Return an empty observable on error
      })
    ).subscribe(res => {
      this.isCheckingEmail = false;  // Stop loading indication after API call

      if (res && res.status === 'error') {
        this.emailExists = true;
        this.ToastrService.error(res.msg);  // Show error if email exists
      } else {
        this.emailExists = false;  // Reset the email existence status if available
      }
    });
  }

  // Handle the password confirmation validation
  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')!.value;
    const confirmPassword = form.get('confirmPassword')!.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Handle route query parameters for forgot password
  public getActivatedRouteValue() {
    this.activatedRoute.queryParamMap.subscribe(params => {
      let value = params.get('forgetPassword');
      if (value === 'true') {
        this.forGetPassword = true;
        this.updateValidation();
        return;
      }
      this.forGetPassword = false;
    });
  }

  // Build OTP form
  public buildOTPForm() {
    this.otpForm = this.formBuilder.group({
      otpOne: ["", Validators.required],
      otpTwo: ["", Validators.required],
      otpThree: ["", Validators.required],
      otpFour: ["", Validators.required],
      otpFive: ["", Validators.required],
      otpSix: ["", Validators.required],
    });
  }

  // Confirm OTP
  public confirmOtp() {
    const finalOtp = Object.values(this.otpForm.value).join("");
    this.authService.validateEmail(finalOtp).pipe(
      tap(res => {
        if (res.status === 'success') {
          this.isOtpVerified = true;
        }
      }),
    ).subscribe();
  }

  // Register user with new password
  public registerUser() {
    this.authService.createUser(this.registrationForm.value).pipe(
      tap(res => {
        this.ToastrService.success(res?.msg);
        this.registrationForm.reset();
      }),
    ).subscribe();
  }

  // Request OTP for email verification
  public getOtp() {
    const payload = {
      email: this.registrationForm.value.email,
    };
    this.authService.validateEmail(payload).pipe(
      tap(res => {
        if (res.status === 'success') {
          this.afterotpValidation();
        }
      })
    ).subscribe();
  }

  // Disable password and confirm password validation for forgot password
  public updateValidation() {
    this.registrationForm.controls['password'].setValidators(null);
    this.registrationForm.controls['confirmPassword'].setValidators(null);
    this.registrationForm.controls['password'].updateValueAndValidity();
    this.registrationForm.controls['confirmPassword'].updateValueAndValidity();
  }

  // Enable password and confirm password validation after OTP validation
  public afterotpValidation() {
    this.registrationForm.controls['password'].setValidators(Validators.required);
    this.registrationForm.controls['confirmPassword'].setValidators(Validators.required);
    this.registrationForm.controls['password'].updateValueAndValidity();
    this.registrationForm.controls['confirmPassword'].updateValueAndValidity();
  }

  // Placeholder for form submission (you can use this for custom logic if needed)
  public submitForm() {
    // Custom logic for form submission (optional)
  }
}
