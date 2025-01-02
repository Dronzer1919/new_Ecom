import { Component } from '@angular/core';
import { tap } from 'rxjs';
import { AuthService } from '../auth.service';
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
