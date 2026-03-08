import type { HistoryRecord, HistoryStorage } from '@/types/history';

const STORAGE_KEY = 'fluffySwap_history';
const MAX_RECORDS = 50;

/** 检测是否为 H5 环境（小程序没有 document） */
const isH5 = (): boolean => {
  // @ts-ignore
  return typeof document !== 'undefined';
};

export class HistoryService {
  private storage: HistoryStorage;

  constructor() {
    this.storage = this.load();
  }

  /** 从本地存储加载数据 */
  private load(): HistoryStorage {
    try {
      let raw: string | null = null;

      if (isH5()) {
        raw = localStorage.getItem(STORAGE_KEY);
      } else {
        // 小程序环境
        const data = uni.getStorageSync(STORAGE_KEY);
        raw = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
      }

      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('History load failed:', e);
    }
    return { records: [], maxCount: MAX_RECORDS, version: 1 };
  }

  /** 保存到本地存储 */
  private persist(): void {
    try {
      const data = JSON.stringify(this.storage);

      if (isH5()) {
        localStorage.setItem(STORAGE_KEY, data);
      } else {
        // 小程序环境
        uni.setStorageSync(STORAGE_KEY, data);
      }
    } catch (e) {
      console.error('History persist failed:', e);
    }
  }

  /** 添加新记录 */
  add(record: Omit<HistoryRecord, 'id' | 'createdAt'>): HistoryRecord {
    const newRecord: HistoryRecord = {
      ...record,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
    };

    // 插入到最前面（最新的在前）
    this.storage.records.unshift(newRecord);

    // 超出限制时删除最旧的
    if (this.storage.records.length > this.storage.maxCount) {
      this.storage.records = this.storage.records.slice(0, this.storage.maxCount);
    }

    this.persist();
    return newRecord;
  }

  /** 获取所有记录（按时间倒序） */
  getAll(): HistoryRecord[] {
    return [...this.storage.records];
  }

  /** 根据 ID 获取单条记录 */
  getById(id: string): HistoryRecord | undefined {
    return this.storage.records.find(r => r.id === id);
  }

  /** 删除单条记录 */
  remove(id: string): boolean {
    const index = this.storage.records.findIndex(r => r.id === id);
    if (index > -1) {
      this.storage.records.splice(index, 1);
      this.persist();
      return true;
    }
    return false;
  }

  /** 更新记录（用于任务完成后更新） */
  update(id: string, updates: Partial<HistoryRecord>): boolean {
    const record = this.storage.records.find(r => r.id === id);
    if (record) {
      Object.assign(record, updates);
      this.persist();
      return true;
    }
    return false;
  }

  /** 根据任务 ID 查找记录 */
  getByTaskId(taskId: string): HistoryRecord | undefined {
    return this.storage.records.find(r => r.taskId === taskId);
  }

  /** 清空所有记录 */
  clear(): void {
    this.storage.records = [];
    this.persist();
  }

  /** 清理失败的记录（没有结果图且不在处理中） */
  clearFailedRecords(): number {
    const before = this.storage.records.length;
    this.storage.records = this.storage.records.filter(r =>
      r.isProcessing || r.resultImage // 保留处理中的和有结果图的
    );
    const removed = before - this.storage.records.length;
    if (removed > 0) {
      this.persist();
    }
    return removed;
  }

  /** 获取记录数量 */
  getCount(): number {
    return this.storage.records.length;
  }
}

// 导出单例
export const historyService = new HistoryService();
