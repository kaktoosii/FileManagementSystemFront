import {
  NgModule,
  ModuleWithProviders,
  SkipSelf,
  Optional,
} from "@angular/core";
import { Configuration } from "./configuration";
import { HttpClient } from "@angular/common/http";

import { AccountService } from "./api/account.service";
import { ApiSettingsService } from "./api/apiSettings.service";
import { AuthService } from "./api/auth.service";
import { CategoryService } from "./api/category.service";
import { ContentService } from "./api/content.service";
import { ContentGroupService } from "./api/contentGroup.service";
import { DocumentService } from "./api/document.service";
import { LocationService } from "./api/location.service";
import { MessagesService } from "./api/messages.service";
import { PaymentsService } from "./api/payments.service";
import { PublicService } from "./api/public.service";
import { SettingsService } from "./api/settings.service";
import { SlidersService } from "./api/sliders.service";
import { SupportsService } from "./api/supports.service";
import { UsersService } from "./api/users.service";

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: [
    AccountService,
    ApiSettingsService,
    AuthService,
    CategoryService,
    ContentService,
    ContentGroupService,
    DocumentService,
    LocationService,
    MessagesService,
    PaymentsService,
    PublicService,
    SettingsService,
    SlidersService,
    SupportsService,
    UsersService,
  ],
})
export class ApiModule {
  public static forRoot(
    configurationFactory: () => Configuration,
  ): ModuleWithProviders<ApiModule> {
    return {
      ngModule: ApiModule,
      providers: [{ provide: Configuration, useFactory: configurationFactory }],
    };
  }

  constructor(
    @Optional() @SkipSelf() parentModule: ApiModule,
    @Optional() http: HttpClient,
  ) {
    if (parentModule) {
      throw new Error(
        "ApiModule is already loaded. Import in your base AppModule only.",
      );
    }
    if (!http) {
      throw new Error(
        "You need to import the HttpClientModule in your AppModule! \n" +
          "See also https://github.com/angular/angular/issues/20575",
      );
    }
  }
}
