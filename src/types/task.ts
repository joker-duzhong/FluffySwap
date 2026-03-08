import type { StyleItem } from '@/stores/petStore';

/** 任务状态 */
export type TaskStatus = 'pending' | 'processing' | 'success' | 'failed' | 'timeout';

/** 进行中的任务 */
export interface PendingTask {
  taskId: string;           // API 返回的任务 ID
  originalImage: string;    // 原始图片 URL
  styleId: number;          // 风格 ID
  styleName: string;        // 风格名称
  stylePrompt: string;      // 风格 prompt
  createdAt: number;        // 创建时间
  status: TaskStatus;       // 当前状态
}

/** 任务存储结构 */
export interface TaskStorage {
  currentTask: PendingTask | null;
  version: number;
}
