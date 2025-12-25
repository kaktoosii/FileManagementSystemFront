export interface ApprovalLevel {
  id: number;
  order: number;
  reviewerUserId: number;
  reviewerUser?: string;
  isFinal: boolean;
}

export interface ApprovalLevelDto {
  order: number;
  reviewerUserId: number;
  isFinal: boolean;
}
