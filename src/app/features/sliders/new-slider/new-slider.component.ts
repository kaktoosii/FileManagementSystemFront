import { Component, EventEmitter, inject, Output } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { SliderService } from "../sliders.service";

@Component({
  selector: "shop-new-slider",
  imports: [FormsModule, ReactiveFormsModule, NzInputModule, NzFormModule],
  templateUrl: "./new-slider.component.html",
  styleUrl: "./new-slider.component.scss",
})
export class NewSliderComponent {
  @Output() close = new EventEmitter<void>();

  private readonly api = inject(SliderService);

  private readonly _fb = inject(FormBuilder);

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this._fb.group({
      title: ["", Validators.required],
      showCode: ["", Validators.required],
    });
  }

  async submit() {
    this.api.CreateSlider({ ...this.form.value }).subscribe(() => {
      this.close.emit();
    });
  }
}
