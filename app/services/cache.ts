import { CacheData } from '../types';

// 缓存配置
const CACHE_CONFIG = {
  // 新鲜缓存：30秒
  FRESH_CACHE_DURATION: 30 * 1000,
  // 旧数据缓存：5分钟
  STALE_CACHE_DURATION: 5 * 60 * 1000,
};

// 缓存存储
export class CacheService {
  private cache: Map<string, CacheData<any>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param isFresh 是否为新鲜缓存
   */
  set<T>(key: string, data: T, isFresh: boolean = true): void {
    const now = Date.now();
    const expire = now + (isFresh ? CACHE_CONFIG.FRESH_CACHE_DURATION : CACHE_CONFIG.STALE_CACHE_DURATION);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expire,
    });
    
    console.log(`[CACHE] Set cache for ${key}, expire at ${new Date(expire).toISOString()}`);
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @param allowStale 是否允许返回旧数据
   * @returns 缓存数据或null
   */
  get<T>(key: string, allowStale: boolean = false): T | null {
    const cacheItem = this.cache.get(key);
    if (!cacheItem) {
      console.log(`[CACHE] Miss cache for ${key}`);
      return null;
    }

    const now = Date.now();
    
    // 检查缓存是否完全过期
    if (now > cacheItem.expire) {
      this.cache.delete(key);
      console.log(`[CACHE] Expired cache deleted for ${key}`);
      return null;
    }

    // 检查缓存是否为旧数据且不允许返回旧数据
    const isStale = now > cacheItem.timestamp + CACHE_CONFIG.FRESH_CACHE_DURATION;
    if (isStale && !allowStale) {
      console.log(`[CACHE] Stale cache for ${key}, but allowStale is false`);
      return null;
    }

    console.log(`[CACHE] Hit cache for ${key}, ${isStale ? 'stale' : 'fresh'}`);
    return cacheItem.data as T;
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key);
    console.log(`[CACHE] Delete cache for ${key}`);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    console.log(`[CACHE] Clear all cache`);
  }
}

// 导出单例实例
export const cacheService = new CacheService();