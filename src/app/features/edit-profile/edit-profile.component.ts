import { Component, inject, OnInit, signal } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { ProfileService } from "./profile.service";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzButtonModule } from "ng-zorro-antd/button";
import { ImageUploadComponent } from "@features/image-upload/image-upload.component";

@Component({
  selector: "app-edit-profile",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    ImageUploadComponent,
  ],
  templateUrl: "./edit-profile.component.html",
  styleUrls: ["./edit-profile.component.scss"],
})
export default class EditProfileComponent implements OnInit {
  form!: FormGroup;
  isLoading = signal(false);

  private readonly _fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);

  ngOnInit(): void {
    this.form = this._fb.group({
      username: ["", Validators.required],
      displayName: ["", Validators.required],
      mobileNumber: ["", [Validators.required, Validators.pattern("^[0-9]+$")]],
      profileImage: [null, Validators.required],
    });

    this.loadUserProfile();
  }
  loadUserProfile() {
    this.isLoading.set(true);
    this.profileService.getProfile().subscribe((data) => {
      this.form.patchValue(data.data);
      this.isLoading.set(false);
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.profileService.updateProfile(this.form.value).subscribe(() => {
      alert("Profile updated successfully!");
    });
  }
}
