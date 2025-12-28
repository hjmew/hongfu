// 飞书API响应基础结构
export interface FeishuResponse<T> {
  code: number;
  msg: string;
  data?: T;
}

// Tenant Access Token响应
export interface TenantAccessTokenResponse {
  tenant_access_token: string;
  expire: number;
}

// 字段属性
export interface FieldProperty {
  options?: Array<{
    color: number;
    id: string;
    name: string;
  }>;
  // 其他可能的属性
  [key: string]: any;
}

// 表格字段
export interface TableField {
  field_id: string;
  field_name: string;
  is_hidden: boolean;
  is_primary: boolean;
  property: FieldProperty | null;
  type: number;
  ui_type: string;
}

// 表格字段列表响应
export interface TableFieldsResponse {
  has_more: boolean;
  items: TableField[];
}

// 提交人信息
export interface Submitter {
  en_name: string;
  id: string;
  name: string;
}

// 表格记录字段值
export interface RecordFields {
  编号: string;
  提交人: Submitter[];
  提交时间: number;
  楼栋号: string;
  楼层: string;
  房号: string;
  安全状态: string;
  受伤情况?: string;
  特殊情况?: string[];
  补充说明?: Array<{
    text: string;
    type: string;
  }>;
  [key: string]: any;
}

// 表格记录
export interface TableRecord {
  fields: RecordFields;
  record_id: string;
}

// 表格记录列表响应
export interface TableRecordsResponse {
  has_more: boolean;
  items: TableRecord[];
  total: number;
}

// 安全状态类型
export type SafetyStatus = 'safe' | 'danger' | 'emergency';

// 单元格状态
export interface CellStatus {
  status: SafetyStatus;
  records: TableRecord[];
}

// 楼层数据
export interface FloorData {
  [room: string]: CellStatus;
}

// 单栋楼数据
export interface SingleBuildingData {
  [floor: string]: FloorData;
}

// 所有楼栋数据
export interface BuildingData {
  [building: string]: SingleBuildingData;
}

// 应用配置
export interface AppConfig {
  feishuAppId: string;
  feishuAppSecret: string;
  feishuAppToken: string;
  feishuTableId: string;
  feishuViewId: string;
  submitUrl: string;
}

// 数据统计信息
export interface DataStats {
  totalRecords: number;
  lastUpdateTime: number;
}

// 缓存数据结构
export interface CacheData<T> {
  data: T;
  timestamp: number;
  expire: number;
}