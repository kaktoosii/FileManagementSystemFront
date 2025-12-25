import {
  Component,
  inject,
  Input,
  OnInit,
  signal,
  WritableSignal,
} from "@angular/core";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzDividerModule } from "ng-zorro-antd/divider";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { NzTableModule } from "ng-zorro-antd/table";
import { finalize } from "rxjs";
import { NewSlideComponent } from "./new-slide/new-slide.component";
import { SlideViewModel } from "@models";
import { SliderService } from "../sliders.service";
import { ImageURLResolverPipe } from "@core/image-url-resolver.pipe";
import { EditSlideComponent } from "./edit-slide/edit-slide.component";

@Component({
  selector: "shop-slides",
  imports: [
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzModalModule,
    NewSlideComponent,
    EditSlideComponent,
    ImageURLResolverPipe,
    NzIconModule,
  ],
  templateUrl: "./slides.component.html",
  styleUrl: "./slides.component.scss",
})
export class SlidesComponent implements OnInit {
  @Input({ required: true }) sliderId: number = 0;

  private readonly modal = inject(NzModalService);
  private readonly api = inject(SliderService);

  slide!: SlideViewModel;
  slides: WritableSignal<SlideViewModel[]> = signal([]);

  pending = signal(false);
  pageIndex = signal(1);
  pageSize = signal(10);
  totalNumber = signal(1);

  isNewSlideVisible = signal(false);
  EditSlideVisible = signal(false);

  ngOnInit(): void {
    this.GetList();
  }

  GetList() {
    this.pending.set(true);

    this.api
      .GetSlidesList(this.sliderId, {
        PageNumber: this.pageIndex(),
        PageSize: this.pageSize(),
      })
      .pipe(finalize(() => this.pending.set(false)))
      .subscribe((res) => {
        this.slides.set(res.data!);
        this.totalNumber.set(res.totalRecords ?? 0);
        this.pageIndex.set(res.pageNumber ?? 1);
        this.pageSize.set(res.pageSize ?? 10);
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
  edit(data: SlideViewModel) {
    this.EditSlideVisible = signal(true);
    this.slide = data;
  }
  delete(id: number) {
    this.modal.confirm({
      nzTitle: "آیا مایل به حذف هستید؟",
      nzOkText: "بله",
      nzOkType: "primary",
      nzOkDanger: true,
      nzOnOk: () => {
        this.api
          .DeleteSlide(this.sliderId, id!)
          .pipe(finalize(() => this.pending.set(false)))
          .subscribe(() => {
            this.GetList();
          });
      },
      nzCancelText: "خیر",
    });
  }
}
