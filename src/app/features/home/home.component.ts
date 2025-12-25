import { Component, inject, OnInit } from "@angular/core";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzIconModule } from "ng-zorro-antd/icon";
import { DashboardService } from "./dashboard.service";
import { CommonModule } from "@angular/common";
import { ImageURLResolverPipe } from "@core/image-url-resolver.pipe";
import { NzBadgeModule } from "ng-zorro-antd/badge";
import { RouterModule } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";

@Component({
  selector: "shop-home",
  imports: [
    NzCardModule,
    NzIconModule,
    CommonModule,
    NzBadgeModule,
    RouterModule,
    NzModalModule,
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export default class HomeComponent implements OnInit {
  // private readonly api = inject(DashboardService);
  userCount: number = 0;
  constructor(
    private nzMessage: NzMessageService,
    private modal: NzModalService,
  ) {}
  ngOnInit(): void {}
}
