import type { PointsStorage } from '@/types/points';
import { DAILY_SIGN_IN_BONUS } from '@/types/points';

const STORAGE_KEY = 'fluffySwap_points';

/** 检测是否为 H5 环境 */
const isH5 = (): boolean => {
  // @ts-ignore
  return typeof document !== 'undefined';
};

/** 获取今天的日期字符串 */
const getTodayStr = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

class PointsService {
  private storage: PointsStorage;

  constructor() {
    this.storage = this.load();
  }

  /** 从本地存储加载 */
  private load(): PointsStorage {
    try {
      let raw: string | null = null;

      if (isH5()) {
        raw = localStorage.getItem(STORAGE_KEY);
      } else {
        const data = uni.getStorageSync(STORAGE_KEY);
        raw = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        // 确保所有字段存在
        return {
          balance: parsed.balance ?? 0,
          lastSignInDate: parsed.lastSignInDate ?? '',
          totalEarned: parsed.totalEarned ?? 0,
          totalSpent: parsed.totalSpent ?? 0,
          version: parsed.version ?? 1,
        };
      }
    } catch (e) {
      console.warn('Points load failed:', e);
    }
    return {
      balance: 0,
      lastSignInDate: '',
      totalEarned: 0,
      totalSpent: 0,
      version: 1,
    };
  }

  /** 保存到本地存储 */
  private persist(): void {
    try {
      const data = JSON.stringify(this.storage);

      if (isH5()) {
        localStorage.setItem(STORAGE_KEY, data);
      } else {
        uni.setStorageSync(STORAGE_KEY, data);
      }
    } catch (e) {
      console.error('Points persist failed:', e);
    }
  }

  /** 获取当前点数余额 */
  getBalance(): number {
    return this.storage.balance;
  }

  /** 获取存储数据 */
  getStorage(): PointsStorage {
    return { ...this.storage };
  }

  /** 检查今天是否已签到 */
  hasSignedInToday(): boolean {
    return this.storage.lastSignInDate === getTodayStr();
  }

  /**
   * 每日签到
   * @returns 签到获得的点数，如果已签到返回 0
   */
  signIn(): number {
    if (this.hasSignedInToday()) {
      return 0;
    }

    this.storage.balance += DAILY_SIGN_IN_BONUS;
    this.storage.lastSignInDate = getTodayStr();
    this.storage.totalEarned += DAILY_SIGN_IN_BONUS;
    this.persist();

    return DAILY_SIGN_IN_BONUS;
  }

  /**
   * 消耗点数
   * @param amount 消耗数量
   * @returns 是否成功消耗
   */
  spend(amount: number): boolean {
    if (this.storage.balance < amount) {
      return false;
    }

    this.storage.balance -= amount;
    this.storage.totalSpent += amount;
    this.persist();

    return true;
  }

  /**
   * 增加点数（用于充值等场景）
   * @param amount 增加数量
   * @param reason 原因
   */
  add(amount: number, reason: string = '充值'): void {
    this.storage.balance += amount;
    this.storage.totalEarned += amount;
    this.persist();

    console.log(`Points added: +${amount}, reason: ${reason}, new balance: ${this.storage.balance}`);
  }

  /**
   * 检查是否有足够的点数
   * @param amount 需要的点数
   */
  canAfford(amount: number): boolean {
    return this.storage.balance >= amount;
  }

  /**
   * 初始化新用户（已取消自动赠送，用户需通过签到获取点数）
   */
  initNewUser(): void {
    // 不再自动赠送，用户需要通过签到获取点数
  }
}

export const pointsService = new PointsService();
