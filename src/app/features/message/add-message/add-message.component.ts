import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MessageService } from "../message.service";
import { NzMessageService } from "ng-zorro-antd/message";
import { Router } from "@angular/router";
import { MessageViewModel } from "@models";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzInputModule } from "ng-zorro-antd/input";

@Component({
  selector: "app-add-message",
  templateUrl: "./add-message.component.html",
  styleUrl: "./add-message.component.scss",
  standalone: true,
  imports: [
    NzCardModule,
    NzFormModule,
    ReactiveFormsModule,
    NzInputModule,
    NzButtonModule,
  ],
})
export default class AddMessageComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private nzMessage: NzMessageService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      subject: ["", Validators.required],
      description: ["", Validators.required],
    });
  }

  // ارسال پیام جدید
  submit(): void {
    if (this.form.invalid) {
      this.nzMessage.error("لطفاً تمام فیلدها را تکمیل کنید");
      return;
    }

    const newMessage: MessageViewModel = this.form.value;

    this.messageService.addMessage(newMessage).subscribe(
      () => {
        this.nzMessage.success("پیام با موفقیت ارسال شد");
        this.router.navigate(["/dashboard/messages"]);
      },
      () => this.nzMessage.error("خطا در ارسال پیام"),
    );
  }
  goBack() {
    window.history.back();
  }
}
