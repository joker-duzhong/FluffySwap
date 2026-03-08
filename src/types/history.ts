export interface HistoryRecord {
  id: string;              // 唯一标识 (timestamp + random)
  originalImage: string;   // 原始宠物图片 URL
  resultImage: string;     // 生成的结果图片 URL
  styleId: number;         // 风格 ID
  styleName: string;       // 风格名称
  createdAt: number;       // 创建时间戳
  hasPaid: boolean;        // 是否已付费解锁高清
  isProcessing?: boolean;  // 是否正在处理中
  taskId?: string;         // 关联的任务 ID（用于继续轮询）
}

export interface HistoryStorage {
  records: HistoryRecord[];
  maxCount: number;        // 最大存储条数
  version: number;         // 数据版本号
}
