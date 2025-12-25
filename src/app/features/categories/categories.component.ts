import { NgTemplateOutlet } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { CategoryService } from "./category.service";
import { CategoryViewModel } from "../../gen/model/categoryViewModel";
import { NzModalModule } from "ng-zorro-antd/modal";
import { NewSubCategoryComponent } from "./new-sub-category/new-sub-category.component";
import { finalize } from "rxjs";
import { EditCategoryComponent } from "./edit-category/edit-category.component";

interface TreeNode<T = any> {
  id: number;
  title: string;
  loaded?: boolean;
  expanded?: boolean;
  pending?: boolean;
  children: TreeNode[];
  data: T;
  level: number;
  refreshParentFn: () => void;
}

@Component({
  selector: "shop-categories",
  imports: [
    NgTemplateOutlet,
    NzModalModule,
    NewSubCategoryComponent,
    EditCategoryComponent,
  ],
  providers: [CategoryService],
  templateUrl: "./categories.component.html",
  styleUrl: "./categories.component.scss",
})
export default class CategoriesComponent {
  private readonly api = inject(CategoryService);

  public tree: TreeNode<CategoryViewModel>[] = [];

  readonly colors: any = {
    1: "bg-gray-200",
    2: "bg-gray-300",
    3: "bg-gray-400 text-white",
    4: "bg-gray-500 text-white",
    5: "bg-gray-600 text-white",
    6: "bg-gray-700 text-white",
    7: "bg-gray-800 text-white",
  };

  readonly isNewScheduleVisible = signal(false);
  readonly isEditScheduleVisible = signal(false);
  readonly selectedNode = signal<TreeNode<CategoryViewModel> | undefined>(
    undefined,
  );

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories() {
    this.api.GetCategorysChildByShowCode("primary").subscribe((res) => {
      this.tree =
        res.data.map(
          this.convertCategoryToTreeNode(0, () => {
            this.getCategories();
          }),
        ) ?? [];
    });
  }

  private convertCategoryToTreeNode(
    parentLevel: number,
    refreshParentFn: () => void,
  ): (
    value: CategoryViewModel,
    index: number,
    array: CategoryViewModel[],
  ) => TreeNode<CategoryViewModel> {
    return (v) => ({
      id: v.id!,
      title: v.title!,
      loaded: v.categoryCount == 0,
      children: [],
      data: v,
      level: parentLevel + 1,
      refreshParentFn,
    });
  }

  async deleteNode(item: TreeNode<CategoryViewModel>) {
    if (item.pending) return;

    item.pending = true;

    this.api
      .Delete(item.id)
      .pipe(
        finalize(() => {
          item.pending = false;
        }),
      )
      .subscribe(() => {
        item.refreshParentFn();
      });
  }

  async loadNodeChildren(item: TreeNode<CategoryViewModel>) {
    if (item.pending) return;

    item.pending = true;

    this.api
      .GetCategorysChildByShowCode(item.data.showCode)
      .pipe(
        finalize(() => {
          item.pending = false;
        }),
      )
      .subscribe((res) => {
        item.children =
          res.data?.map(
            this.convertCategoryToTreeNode(item.level, () => {
              item.expanded = true;
              this.loadNodeChildren(item);
            }),
          ) ?? [];

        item.loaded = true;
      });
  }
}
