import { Routes } from "@angular/router";
import { AuthGuard } from "@core/auth-guard";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: async () => await import("./features/login/login.component"),
  },
  {
    path: "report-viewer/:id",
    loadComponent: async () =>
      await import("./features/report-viewer/report-viewer.component"),
    canActivate: [AuthGuard],
  },
  {
    path: "dashboard",
    loadComponent: async () =>
      await import("./features/main/main.component"),
    canActivate: [AuthGuard],
    children: [
      {
        path: "setting",
        loadComponent: async () =>
          await import("./features/setting/setting.component"),
      },
      {
        path: "users/access/:userId",
        loadComponent: async () =>
          await import("./features/dynamic-permissions/dynamic-permissions.component"),
      },
      {
        path: "support/:id",
        loadComponent: async () =>
          await import("./features/support/support-detail/support-detail.component"),
      },
      {
        path: "support",
        loadComponent: async () =>
          await import("./features/support/support.component"),
      },
      {
        path: "profile",
        loadComponent: async () =>
          await import("./features/edit-profile/edit-profile.component"),
      },
      {
        path: "change-password",
        loadComponent: async () =>
          await import("./features/change-password/change-password.component"),
      },
      {
        path: "users/add",
        loadComponent: async () =>
          await import("./features/users/add-user/add-user.component"),
      },
      {
        path: "users/edit/:id",
        loadComponent: async () =>
          await import("./features/users/add-user/add-user.component"),
      },
      {
        path: "users",
        loadComponent: async () =>
          await import("./features/users/users.component"),
      },
      {
        path: "reports",
        loadComponent: async () =>
          await import("./features/report-designer/report-designer.component"),
      },
      {
        path: "sliders",
        loadComponent: async () =>
          await import("./features/sliders/sliders.component"),
      },
      {
        path: "messages",
        loadComponent: async () =>
          await import("./features/message/message.component"),
      },
      {
        path: "messages/add",
        loadComponent: async () =>
          await import("./features/message/add-message/add-message.component"),
      },
      {
        path: "home",
        loadComponent: async () =>
          await import("./features/home/home.component"),
      },
      {
        path: "files",
        loadComponent: async () =>
          await import("./features/files/file-management.component"),
      },
      {
        path: "files/upload",
        loadComponent: async () =>
          await import("./features/files/upload-file.component"),
      },
      {
        path: "**",
        redirectTo: "/home",
        pathMatch: "full",
      },
    ],
  },
  {
    path: "**",
    redirectTo: "/login",
    pathMatch: "full",
  },
];
