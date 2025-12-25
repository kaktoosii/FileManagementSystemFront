import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTableModule } from 'ng-zorro-antd/table';
import { DynamicPermissionsService, SecuredActionsResponse, DynamicClaimsDto } from './dynamic-permissions.service';

// ... سایر import ها همانند قبل
@Component({
  selector: 'app-dynamic-permissions',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzEmptyModule,
    NzSpinModule,
    NzCheckboxModule,
    FormsModule,
    NzCollapseModule,
    NzTableModule,
  ],
  templateUrl: './dynamic-permissions.component.html',
  styleUrls: ['./dynamic-permissions.component.scss'],
})
export default class DynamicPermissionsComponent implements OnInit {
  private readonly permissionsService = inject(DynamicPermissionsService);
  private readonly messageService = inject(NzMessageService);
  private readonly route = inject(ActivatedRoute);

  securedActionsResponse = signal<SecuredActionsResponse | null>(null);
  pending = signal<boolean>(false);
  selectedUserId = signal<number>(1);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const userId = Number(params.get('userId'));
      if (userId) {
        this.selectedUserId.set(userId);
        this.loadPermissions();
      }
    });
  }

  loadPermissions(): void {
    this.pending.set(true);
    this.permissionsService.getDynamicallySecuredServerActions(this.selectedUserId()).subscribe({
      next: (response) => {
        if (response.userClaims && !response.userClaims.claimValues) {
          response.userClaims.claimValues = [];
        }
        this.securedActionsResponse.set(response);
        this.pending.set(false);
      },
      error: () => {
        this.messageService.error('خطا در بارگذاری دسترسی‌ها.');
        this.pending.set(false);
      },
    });
  }

  isActionChecked(controllerName: string, action: { actionName: string; httpMethods: string[] }): boolean {
    const area = '';
    const claimValues = this.securedActionsResponse()?.userClaims?.claimValues || [];
    return action.httpMethods.some(httpMethod =>
      claimValues.includes(`${area}:${controllerName}:${action.actionName}:${httpMethod}`)
    );
  }

  onClaimChange(controllerName: string, action: { actionName: string; httpMethods: string[] }, isChecked: boolean): void {
    const response = this.securedActionsResponse();
    if (!response || !response.userClaims) return;

    const area = '';
    const currentClaimValues = [...(response.userClaims.claimValues || [])];
    const newClaimValues = action.httpMethods.map(httpMethod => `${area}:${controllerName}:${action.actionName}:${httpMethod}`);

    const updatedClaimValues = isChecked
      ? Array.from(new Set([...currentClaimValues, ...newClaimValues]))
      : currentClaimValues.filter(claim => !newClaimValues.includes(claim));

    response.userClaims.claimValues = updatedClaimValues;
    this.securedActionsResponse.set({ ...response });

    this.updateClaimsOnServer(updatedClaimValues, isChecked);
  }

  // 🔹 متد برای اعطا یا لغو همه اکشن‌ها در یک کنترلر
  toggleAll(controller: any, grantAll: boolean) {
    const response = this.securedActionsResponse();
    if (!response || !response.userClaims) return;

    const area = '';
    let allClaimValues: string[] = [];

    if (grantAll) {
      // تمام اکشن‌ها را اضافه کن
      controller.apiActions.forEach((action: any) => {
        allClaimValues.push(...action.httpMethods.map((httpMethod: string) =>
          `${area}:${controller.controllerName}:${action.actionName}:${httpMethod}`
        ));
      });
      // merge با claimValues موجود و remove duplicates
      const currentClaimValues = response.userClaims.claimValues || [];
      response.userClaims.claimValues = Array.from(new Set([...currentClaimValues, ...allClaimValues]));
    } else {
      // همه اکشن‌ها را حذف کن
      const currentClaimValues = response.userClaims.claimValues || [];
      controller.apiActions.forEach((action: any) => {
        action.httpMethods.forEach((httpMethod: string) => {
          const val = `${area}:${controller.controllerName}:${action.actionName}:${httpMethod}`;
          const index = currentClaimValues.indexOf(val);
          if (index > -1) currentClaimValues.splice(index, 1);
        });
      });
      response.userClaims.claimValues = currentClaimValues;
    }

    this.securedActionsResponse.set({ ...response });
    this.updateClaimsOnServer(response.userClaims.claimValues, grantAll);
  }

  // متد مشترک برای ارسال به سرور
  private updateClaimsOnServer(claimValues: string[], isGranted: boolean) {
    const model: DynamicClaimsDto = {
      userId: this.selectedUserId(),
      claimType: 'DynamicServerPermission',
      inputClaimValues: claimValues,
    };

    this.permissionsService.addOrUpdateClaims(model).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.success(`دسترسی ${isGranted ? 'اعطا' : 'لغو'} شد.`);
        } else {
          this.messageService.error(`خطا در ${isGranted ? 'اعطای' : 'لغو'} دسترسی.`);
        }
      },
      error: () => {
        this.messageService.error('خطا در ارتباط با سرور.');
      },
    });
  }

  // متدهای کمکی برای header
  countGranted(controller: any): number {
    return controller.apiActions.filter((a: any) => this.isActionChecked(controller.controllerName, a)).length;
  }

  allGranted(controller: any): boolean {
    return controller.apiActions.every((a: any) => this.isActionChecked(controller.controllerName, a));
  }

  partiallyGranted(controller: any): boolean {
    const total = controller.apiActions.length;
    const granted = this.countGranted(controller);
    return granted > 0 && granted < total;
  }

  noneGranted(controller: any): boolean {
    return controller.apiActions.every((a: any) => !this.isActionChecked(controller.controllerName, a));
  }
}

