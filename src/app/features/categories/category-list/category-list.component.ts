import { Component, inject, OnInit, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { NzTableModule } from "ng-zorro-antd/table";
import { CategoryService } from "../category.service";
import { ImageURLResolverPipe } from "@core/image-url-resolver.pipe";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { EditCategoryComponent } from "../edit-category/edit-category.component";
import { NewSubCategoryComponent } from "../new-sub-category/new-sub-category.component";
import { CategoryDto, CategoryViewModel } from "@models";

export interface TreeNodeInterface {
  id: number;
  title?: string;
  showCode?: string;
  documentId?: string;
  level?: number;
  expand?: boolean;
  children?: TreeNodeInterface[];
  parent?: TreeNodeInterface;
}

@Component({
  selector: "app-category-table",
  standalone: true,
  imports: [
    NzTableModule,
    ImageURLResolverPipe,
    NzIconModule,
    NzButtonModule,
    NewSubCategoryComponent,
    EditCategoryComponent,
    NzModalModule,
  ],
  providers: [CategoryService],
  templateUrl: "./category-list.component.html",
})
export default class CategoryTableComponent implements OnInit {
  listOfMapData: TreeNodeInterface[] = [];
  mapOfExpandedData: { [key: string]: TreeNodeInterface[] } = {};
  private readonly api = inject(CategoryService);
  readonly isNewScheduleVisible = signal(false);
  readonly isEditScheduleVisible = signal(false);
  readonly selectedNode = signal<TreeNodeInterface | undefined>(undefined);

  constructor(private http: HttpClient, private modal: NzModalService) {}

  ngOnInit(): void {
    this.getTree();
  }
  getTree() {
    this.api.GetCategorysChildByShowCode("primary").subscribe((categories) => {
      this.listOfMapData = categories.data.map((category) =>
        this.convertToTreeNode(category),
      );
      this.listOfMapData.forEach((item) => {
        this.mapOfExpandedData[item.id] = this.convertTreeToList(item);
      });
    });
  }

  convertToTreeNode(
    category: CategoryViewModel,
    parent?: TreeNodeInterface,
    level: number = 0,
  ): TreeNodeInterface {
    return {
      id: category.id!,
      title: category.title,
      showCode: category.showCode,
      documentId: category.documentId,
      level,
      expand: false,
      parent,
      children: category.categories
        ? category.categories.map((child) =>
            this.convertToTreeNode(child, parent, level + 1),
          )
        : undefined,
    };
  }
  async deleteNode(id: number) {
    this.modal.confirm({
      nzTitle: "آیا از حذف این آیتم مطمئن هستید؟",
      nzContent: '<b style="color: red;"></b>',
      nzOkText: "بله",
      nzOkType: "primary",
      nzOkDanger: true,
      nzOnOk: () =>
        this.api.Delete(id).subscribe(() => {
          this.getTree();
        }),
      nzCancelText: "خیر",
      nzOnCancel: () => console.log("Cancel"),
    });
  }
  addSubNode(item: TreeNodeInterface) {
    this.isNewScheduleVisible.set(true);
    this.selectedNode.set(item);
  }
  editNode(item: TreeNodeInterface) {
    this.isEditScheduleVisible.set(true);
    this.selectedNode.set(item);
  }
  mapTreeNodeToCategoryDto(node: TreeNodeInterface): CategoryDto {
    return {
      id: node.id ? Number(node.id) : undefined, // Convert string ID to number
      title: node.title,
      showCode: node.showCode,
      documentId: node.documentId,
      categoryId: node.parent ? Number(node.parent.id) : undefined, // Use parent's ID as categoryId
    };
  }
  collapse(
    array: TreeNodeInterface[],
    data: TreeNodeInterface,
    $event: boolean,
  ): void {
    if (!$event) {
      if (data.children) {
        data.children.forEach((d) => {
          const target = array.find((a) => a.id === d.id)!;
          target.expand = false;
          this.collapse(array, target, false);
        });
      }
    }
  }

  convertTreeToList(root: TreeNodeInterface): TreeNodeInterface[] {
    const stack: TreeNodeInterface[] = [];
    const array: TreeNodeInterface[] = [];
    const hashMap: { [key: string]: boolean } = {};
    stack.push({ ...root, level: 0, expand: false });

    while (stack.length !== 0) {
      const node = stack.pop()!;
      this.visitNode(node, hashMap, array);
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push({
            ...node.children[i],
            level: node.level! + 1,
            expand: false,
            parent: node,
          });
        }
      }
    }

    return array;
  }

  visitNode(
    node: TreeNodeInterface,
    hashMap: { [key: string]: boolean },
    array: TreeNodeInterface[],
  ): void {
    if (!hashMap[node.id]) {
      hashMap[node.id] = true;
      array.push(node);
    }
  }
}
