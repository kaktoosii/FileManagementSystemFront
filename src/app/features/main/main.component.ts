import { Component, inject, OnInit } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { CookieHandler } from "@core/cookie-handler";
import { ImageURLResolverPipe } from "@core/image-url-resolver.pipe";
import { ProfileService } from "@features/edit-profile/profile.service";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzBreadCrumbModule } from "ng-zorro-antd/breadcrumb";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzMenuModule } from "ng-zorro-antd/menu";
import { PermissionService } from "./permission.service";
import { CommonModule } from "@angular/common";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NzBreadCrumbModule,
    NzIconModule,
    NzMenuModule,
    NzLayoutModule,
    RouterOutlet,
    RouterLink,
    NzDropDownModule,
    ImageURLResolverPipe,
  ],
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  providers:[PermissionService]
})
export default class MainComponent implements OnInit {
  ngOnInit(): void {
    this.loadUserProfile();
  }
  private readonly router = inject(Router);
  private readonly profileService = inject(ProfileService);
  profileImage = "https://avatar.iran.liara.run/public/29";

  private readonly permissionService = new PermissionService();

  // Menu item to permission mapping
  readonly menuPermissions: { [key: string]: string } = {
    './home': ':Dashboard:Get:GET',
    './users': ':Users:Get:GET',
    './files/upload': ':File:Upload:GET',
    './files': ':Folder:GetRootFolders:GET',
    './support': ':Supports:GetAllSupportRequests:GET'
  };

  isCollapsed = false;
  logout() {
    CookieHandler.removeToken();
    CookieHandler.removeRefreshToken();
    this.router.navigate(["/login"]);
  }
  hasPermission(route: string): boolean {
    const permission = this.menuPermissions[route];
    return permission ? this.permissionService.hasPermission(permission) : false;
  }
  loadUserProfile() {
    this.profileService.getProfile().subscribe((data) => {
      this.profileImage = data.data.profileImage;
    });
  }
}
