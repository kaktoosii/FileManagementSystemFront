import { finalize } from "rxjs";
import { UploadImageService } from "./upload-image.service";
import { ImageURLResolverPipe } from "@core/image-url-resolver.pipe";
import { Component, EventEmitter, inject, Input, Output } from "@angular/core";

@Component({
  selector: "shop-image-upload",
  standalone: true,
  imports: [ImageURLResolverPipe],
  providers: [UploadImageService],
  templateUrl: "./image-upload.component.html",
  styleUrls: ["./image-upload.component.scss"],
})
export class ImageUploadComponent {
  @Output() imageSelected = new EventEmitter<string>();
  private readonly api = inject(UploadImageService);

  isLoading = false;

  @Input() pictureId: string | "" = "";

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.isLoading = true;

      this.api
        .uploadImage(file)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe((response) => {
          this.pictureId = response;
          this.imageSelected.emit(this.pictureId);
        });
    }
  }

  deleteImage() {
    this.pictureId = "";
    this.imageSelected.emit(this.pictureId);
    this.isLoading = false;
  }
}
