/** 用户点数存储结构 */
export interface PointsStorage {
  balance: number;           // 当前点数余额
  lastSignInDate: string;    // 最后签到日期 (YYYY-MM-DD)
  totalEarned: number;       // 累计获得点数
  totalSpent: number;        // 累计消耗点数
  version: number;           // 数据版本
}

/** 点数变动记录 */
export interface PointsRecord {
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  timestamp: number;
}

/** 基础 token 换算单位：1000 token = 1 点 */
export const TOKENS_PER_POINT = 1000;

/** 每日签到赠送点数 */
export const DAILY_SIGN_IN_BONUS = 10;
