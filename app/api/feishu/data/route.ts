import { NextResponse } from 'next/server';
import { feishuService } from '@/app/services/feishu';
import { BuildingData, SafetyStatus, TableRecord } from '@/app/types';

// 获取安全状态类型
const getSafetyStatusType = (statusText: string): SafetyStatus => {
  if (statusText.includes('安全')) {
    return 'safe';
  } else if (statusText.includes('危险')) {
    return 'danger';
  } else if (statusText.includes('生命危险')) {
    return 'emergency';
  }
  return 'safe';
};

// 处理表格数据，转换为楼栋-楼层-房号的结构
const processTableData = (records: TableRecord[]) => {
  // 简化的数据处理，直接使用对象结构
  const result: any = {};

  // 遍历所有记录，按楼栋-楼层-房号分组
  for (const record of records) {
    const { 楼栋号, 楼层, 房号 } = record.fields;
    
    // 初始化楼栋
    if (!result[楼栋号]) {
      result[楼栋号] = {};
    }
    
    // 初始化楼层
    if (!result[楼栋号][楼层]) {
      result[楼栋号][楼层] = {};
    }
    
    // 初始化房号记录数组
    if (!result[楼栋号][楼层][房号]) {
      result[楼栋号][楼层][房号] = [];
    }
    
    // 添加记录
    result[楼栋号][楼层][房号].push(record);
  }

  // 对每个房号的记录按时间排序，并设置安全状态
  for (const building in result) {
    for (const floor in result[building]) {
      for (const room in result[building][floor]) {
        const roomRecords = result[building][floor][room];
        
        // 按时间从晚到早排序
        roomRecords.sort((a: TableRecord, b: TableRecord) => b.fields.提交时间 - a.fields.提交时间);
        
        // 获取最新记录的安全状态
        const latestStatus = roomRecords[0].fields.安全状态;
        const statusType = getSafetyStatusType(latestStatus);
        
        // 设置最终的单元格状态
        result[building][floor][room] = {
          status: statusType,
          records: roomRecords,
        };
      }
    }
  }
  
  return result as BuildingData;
};

// GET请求处理
export async function GET() {
  try {
    console.log('[API] Getting feishu data...');
    
    // 获取表格记录
    const recordsResponse = await feishuService.getTableRecords();
    const records = recordsResponse.items;
    
    // 处理数据
    const processedData = processTableData(records);
    
    // 获取楼栋列表
    const buildings = Object.keys(processedData);
    
    // 计算统计信息
    const totalRecords = recordsResponse.total;
    const lastUpdateTime = records.length > 0 
      ? Math.max(...records.map(record => record.fields.提交时间))
      : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        buildings,
        buildingData: processedData,
        stats: {
          totalRecords,
          lastUpdateTime,
        },
      },
    });
  } catch (error) {
    console.error('[API] Error getting feishu data:', error);
    console.error('[API] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json(
      { success: false, error: 'Failed to get feishu data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}