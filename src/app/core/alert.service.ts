import { inject, Injectable } from "@angular/core";
import { NzMessageDataOptions, NzMessageService } from "ng-zorro-antd/message";

@Injectable({ providedIn: "root" })
export class AlertService {
  private readonly alert = inject(NzMessageService);

  private readonly COMMON_CONFIG: NzMessageDataOptions = {
    nzAnimate: true,
    nzDuration: 3000,
    nzPauseOnHover: true,
  };

  private getDuration(message: string): number {
    if (typeof message != "string") return 10;
    const duration = Math.floor((message.length / 5) * 500);
    return duration < 3000 ? 3000 : duration;
  }

  public success(message: string) {
    this.alert.success(message, {
      ...this.COMMON_CONFIG,
      nzDuration: this.getDuration(message),
    });
  }

  public error(message: string) {
    this.alert.error(message, {
      ...this.COMMON_CONFIG,
      nzDuration: this.getDuration(message),
    });
  }

  public warning(message: string) {
    this.alert.warning(message, {
      ...this.COMMON_CONFIG,
      nzDuration: this.getDuration(message),
    });
  }

  public info(message: string) {
    this.alert.info(message, {
      ...this.COMMON_CONFIG,
      nzDuration: this.getDuration(message),
    });
  }
}
