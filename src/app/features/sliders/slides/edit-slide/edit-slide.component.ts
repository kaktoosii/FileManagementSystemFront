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
import { SlideViewModel } from "@models";
@Component({
  selector: "shop-edit-slide",
  templateUrl: "./edit-slide.component.html",
  styleUrl: "./edit-slide.component.scss",
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzFormModule,
    NgPersianDatepickerModule,
    ImageUploadComponent,
  ],
})
export class EditSlideComponent {
  @Input({ required: true }) slide!: SlideViewModel;

  @Output() close = new EventEmitter<void>();

  private readonly api = inject(SliderService);
  private readonly _fb = inject(FormBuilder);

  form!: FormGroup;

  showStartDate = new FormControl();
  endDate = new FormControl();

  ngOnInit(): void {
    this.showStartDate = new FormControl(this.slide.showStartDatePersian);
    this.endDate = new FormControl(this.slide.endDatePersian);
    this.form = this._fb.group({
      title: [this.slide?.title, Validators.required],
      description: [this.slide?.description, null],
      link: [this.slide?.link, Validators.required],
      showStartDate: [this.slide?.showStartDate, Validators.required],
      endDate: [this.slide?.endDate, Validators.required],
      enabled: [this.slide?.enabled, Validators.required],
      pictureId: [this.slide.pictureId, Validators.required],
      priority: [this.slide?.priority, Validators.required],
    });
  }

  async submit() {
    this.api
      .EditSlide(this.slide?.sliderId, {
        ...this.form.value,
        sliderId: this.slide.sliderId,
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
