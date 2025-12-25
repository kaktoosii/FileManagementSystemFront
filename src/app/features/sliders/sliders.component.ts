import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  WritableSignal,
  inject,
  signal,
} from "@angular/core";
import { NzTableModule } from "ng-zorro-antd/table";

import { NzDividerModule } from "ng-zorro-antd/divider";
import { SliderService } from "./sliders.service";
import { finalize } from "rxjs";
import { SliderViewModel } from "@models";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzModalModule } from "ng-zorro-antd/modal";
import { NewSliderComponent } from "./new-slider/new-slider.component";
import { SlidesComponent } from "./slides/slides.component";
@Component({
  selector: "shop-sliders",
  imports: [
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzModalModule,
    NewSliderComponent,
    SlidesComponent,
  ],
  providers: [SliderService],
  templateUrl: "./sliders.component.html",
  styleUrl: "./sliders.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SlidersComponent implements OnInit {
  private readonly api = inject(SliderService);

  sliders: WritableSignal<SliderViewModel[]> = signal([]);
  selected: WritableSignal<SliderViewModel | undefined> = signal(undefined);
  pending = signal(false);
  pageIndex = signal(1);
  pageSize = signal(10);
  totalNumber = signal(1);

  isNewSliderVisible = signal(false);

  ngOnInit(): void {
    this.GetList();
  }

  GetList() {
    this.pending.set(true);

    this.api
      .GetSlidersList({
        PageNumber: this.pageIndex(),
        PageSize: this.pageSize(),
      })
      .pipe(finalize(() => this.pending.set(false)))
      .subscribe((res) => {
        this.sliders.set(res.data!);
      });
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize.set(pageSize);
    this.GetList();
  }

  onPageIndexChange(pageIndex: number) {
    this.pageSize.set(pageIndex);
    this.GetList();
  }
}
