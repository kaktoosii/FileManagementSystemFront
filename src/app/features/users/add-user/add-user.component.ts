import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RegisterUserDto, UserViewModel } from '@models';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserService } from '../users.service';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-add-user',
  standalone: true,
  providers: [UserService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzCardModule
  ],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
})
export default class AddUserComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UserService);
  private readonly messageService = inject(NzMessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isSubmitting = false;
  isEditMode = false;
  userId: string | null = null;

  userForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.minLength(6)]],
    firstName: [''],
    lastName: [''],
    mobileNumber: [''],
    isCheckDistance: [false],
    distance: [0, [Validators.min(0)]],
    deviceId: ['']
  });

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditMode = true;
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      this.loadUserData(this.userId);
    }
  }

  private loadUserData(userId: string): void {
    this.usersService.getUserById(userId).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.userForm.patchValue({
            username: response.data.username,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            mobileNumber: response.data.mobileNumber,
            isCheckDistance: response.data.isCheckDistance,
            distance: response.data.distance,
            deviceId: response.data.deviceId
          });
        } else {
          this.messageService.error('داده‌های کاربر یافت نشد.');
        }
      },
      error: (err) => {
        this.messageService.error('خطا در بارگذاری اطلاعات کاربر: ' + (err.error?.message || err.message));
      },
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const userData: RegisterUserDto = this.userForm.value as RegisterUserDto;

    const action = this.isEditMode
      ? this.usersService.updateUser(this.userId!, userData)
      : this.usersService.registerUser(userData);

    action.subscribe({
      next: (response) => {
        if (response.succeeded) {
          const message = this.isEditMode
            ? 'کاربر با موفقیت ویرایش شد.'
            : `کاربر با شناسه ${response.data} با موفقیت ثبت شد.`;
          this.messageService.success(message);
          this.router.navigate(['/dashboard/users']);
        } else {
          this.messageService.error(this.isEditMode ? 'خطا در ویرایش کاربر.' : 'خطا در ثبت کاربر.');
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        this.messageService.error('خطا در عملیات: ' + (err.error?.message || err.message));
        this.isSubmitting = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/users']);
  }
}
