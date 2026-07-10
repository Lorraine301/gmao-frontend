export interface AppNotification {
  id: number;
  userId: number;
  userFullName: string;
  type: string;
  message: string;
  entityType?: string;
  entityId?: number;
  status: string;
  notificationDate: string;
  createdAt: string;
}