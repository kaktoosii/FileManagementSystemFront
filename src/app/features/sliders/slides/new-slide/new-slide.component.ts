import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { SliderService } from "../../sliders.service";
import { IActiveDate, NgPersianDatepickerModule } from "ng-persian-datepicker";
import { ImageUploadComponent } from "@features/image-upload/image-upload.component";
@Component({
  selector: "shop-new-slide",
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzFormModule,
    NgPersianDatepickerModule,
    ImageUploadComponent,
  ],
  templateUrl: "./new-slide.component.html",
  styleUrl: "./new-slide.component.scss",
})
export class NewSlideComponent {
  @Input({ required: true }) sliderId: number = 0;

  @Output() close = new EventEmitter<void>();

  private readonly api = inject(SliderService);
  private readonly _fb = inject(FormBuilder);

  form!: FormGroup;

  showStartDate = new FormControl(new Date().valueOf());
  endDate = new FormControl(new Date().valueOf());

  ngOnInit(): void {
    this.form = this._fb.group({
      title: ["", Validators.required],
      description: ["", null],
      link: ["", Validators.required],
      showStartDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      enabled: [true, Validators.required],
      pictureId: ["", Validators.required],
      priority: [1, Validators.required],
    });
  }

  async submit() {
    this.api
      .CreateSlide(this.sliderId, {
        ...this.form.value,
        sliderId: this.sliderId,
      })
      .subscribe(() => {
        this.close.emit();
      });
  }

  onSelectEndDate(event: IActiveDate) {
    this.form.get("endDate")?.setValue(event.gregorian);
  }
  onSelectStartDate(event: IActiveDate) {
    this.form.get("showStartDate")?.setValue(event.gregorian);
  }
  onImageSelected(image: string) {
    this.form.get("pictureId")?.setValue(image);
  }
}
