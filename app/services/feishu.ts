import { cacheService } from './cache';
import {
  FeishuResponse,
  TenantAccessTokenResponse,
  TableFieldsResponse,
  TableRecordsResponse,
  AppConfig,
} from '../types';

// 飞书API基础URL
const FEISHU_API_BASE_URL = 'https://open.feishu.cn/open-apis';

// 缓存键
const CACHE_KEYS = {
  TENANT_ACCESS_TOKEN: 'feishu:tenant_access_token',
  TABLE_FIELDS: 'feishu:table_fields',
  TABLE_RECORDS: 'feishu:table_records',
};

// 获取应用配置
const getAppConfig = (): AppConfig => {
  return {
    feishuAppId: process.env.FEISHU_APP_ID || '',
    feishuAppSecret: process.env.FEISHU_APP_SECRET || '',
    feishuAppToken: process.env.FEISHU_APP_TOKEN || '',
    feishuTableId: process.env.FEISHU_TABLE_ID || '',
    feishuViewId: process.env.FEISHU_VIEW_ID || '',
    submitUrl: process.env.NEXT_PUBLIC_SUBMIT_URL || '',
  };
};

// 飞书API服务
export class FeishuService {
  private config: AppConfig;

  constructor() {
    this.config = getAppConfig();
  }

  /**
   * 获取Tenant Access Token
   * @returns Tenant Access Token
   */
  async getTenantAccessToken(): Promise<string> {
    // 尝试从缓存获取
    const cachedToken = cacheService.get<string>(CACHE_KEYS.TENANT_ACCESS_TOKEN);
    if (cachedToken) {
      return cachedToken;
    }

    console.log('[FEISHU] Fetching new tenant_access_token...');
    const startTime = Date.now();

    const response = await fetch(`${FEISHU_API_BASE_URL}/auth/v3/tenant_access_token/internal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: this.config.feishuAppId,
        app_secret: this.config.feishuAppSecret,
      }),
    });

    const endTime = Date.now();
    console.log(`[FEISHU] Fetch tenant_access_token completed in ${endTime - startTime}ms`);

    const responseText = await response.text();
    console.log('[FEISHU] Full response for tenant_access_token:', responseText);
    
    const data = JSON.parse(responseText);
    
    if (data.code !== 0) {
      throw new Error(`Failed to get tenant_access_token: ${data.msg}, code: ${data.code}`);
    }

    // 检查响应结构，飞书API可能直接在根级别返回token和expire
    const tokenData = data.data || data;
    
    if (!tokenData.tenant_access_token) {
      throw new Error(`No tenant_access_token in response, full response: ${responseText}`);
    }

    // 缓存token，过期时间设置为响应的expire减去15分钟（900秒）的缓冲
    const token = tokenData.tenant_access_token;
    const expireInSeconds = Math.max(0, (tokenData.expire || 7200) - 900);
    
    cacheService.set(CACHE_KEYS.TENANT_ACCESS_TOKEN, token, true);
    
    return token;
  }

  /**
   * 获取飞书表格字段
   * @returns 表格字段列表
   */
  async getTableFields(): Promise<TableFieldsResponse> {
    // 尝试从缓存获取
    const cachedFields = cacheService.get<TableFieldsResponse>(CACHE_KEYS.TABLE_FIELDS, true);
    if (cachedFields) {
      return cachedFields;
    }

    const token = await this.getTenantAccessToken();
    
    console.log('[FEISHU] Fetching table fields...');
    const startTime = Date.now();

    const response = await fetch(
      `${FEISHU_API_BASE_URL}/bitable/v1/apps/${this.config.feishuAppToken}/tables/${this.config.feishuTableId}/fields?view_id=${this.config.feishuViewId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        // 禁用Next.js默认缓存
        cache: 'no-store',
      }
    );

    const endTime = Date.now();
    console.log(`[FEISHU] Fetch table fields completed in ${endTime - startTime}ms`);

    const data = await response.json() as FeishuResponse<TableFieldsResponse>;
    
    if (data.code !== 0) {
      throw new Error(`Failed to get table fields: ${data.msg}`);
    }

    if (!data.data) {
      throw new Error('No data in table fields response');
    }

    // 设置缓存
    cacheService.set(CACHE_KEYS.TABLE_FIELDS, data.data, true);
    
    return data.data;
  }

  /**
   * 获取飞书表格记录
   * @returns 表格记录列表
   */
  async getTableRecords(): Promise<TableRecordsResponse> {
    // 尝试从缓存获取
    const cachedRecords = cacheService.get<TableRecordsResponse>(CACHE_KEYS.TABLE_RECORDS, true);
    if (cachedRecords) {
      return cachedRecords;
    }

    const token = await this.getTenantAccessToken();
    
    console.log('[FEISHU] Fetching table records...');
    const startTime = Date.now();

    const response = await fetch(
      `${FEISHU_API_BASE_URL}/bitable/v1/apps/${this.config.feishuAppToken}/tables/${this.config.feishuTableId}/records/search?page_size=500`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          view_id: this.config.feishuViewId,
        }),
        // 禁用Next.js默认缓存
        cache: 'no-store',
      }
    );

    const endTime = Date.now();
    console.log(`[FEISHU] Fetch table records completed in ${endTime - startTime}ms`);

    const data = await response.json() as FeishuResponse<TableRecordsResponse>;
    
    if (data.code !== 0) {
      throw new Error(`Failed to get table records: ${data.msg}`);
    }

    if (!data.data) {
      throw new Error('No data in table records response');
    }

    // 设置缓存
    cacheService.set(CACHE_KEYS.TABLE_RECORDS, data.data, true);
    
    return data.data;
  }

  /**
   * 手动刷新缓存
   */
  async refreshCache(): Promise<void> {
    console.log('[FEISHU] Refreshing cache...');
    
    // 清除相关缓存
    cacheService.delete(CACHE_KEYS.TABLE_FIELDS);
    cacheService.delete(CACHE_KEYS.TABLE_RECORDS);
    
    // 重新获取数据（异步，不等待完成）
    this.getTableFields().catch(err => console.error('[FEISHU] Failed to refresh table fields:', err));
    this.getTableRecords().catch(err => console.error('[FEISHU] Failed to refresh table records:', err));
  }
}

// 导出单例实例
export const feishuService = new FeishuService();