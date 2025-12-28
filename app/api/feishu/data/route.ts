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

// 添加CORS头部
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24小时
};

// OPTIONS请求处理（预检请求）
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// GET请求处理
export async function GET() {
  try {
    // 从飞书API获取表格数据
    const tableData = await feishuService.getTableRecords();
    const records = tableData.items;
    
    // 处理表格数据，转换为楼栋-楼层-房号的结构
    const processedData = processTableData(records);
    
    // 获取所有楼栋名称
    const buildings = Object.keys(processedData).sort();
    
    // 计算统计数据
    let totalRecords = 0;
    for (const building in processedData) {
      for (const floor in processedData[building]) {
        for (const room in processedData[building][floor]) {
          totalRecords += processedData[building][floor][room].records.length;
        }
      }
    }
    
    const result = {
      success: true,
      data: {
        buildings,
        buildingData: processedData,
        stats: {
          totalRecords,
          lastUpdateTime: Date.now(),
        }
      }
    };
    
    // 设置适当的缓存头，减少客户端请求频率
    return NextResponse.json(result, {
      headers: {
        ...corsHeaders, // 添加CORS头部
        'Cache-Control': 'no-store, max-age=0', // 禁用浏览器缓存，但允许CDN缓存
      }
    });
  } catch (error) {
    console.error('Error fetching data from Feishu API:', error);
    
    // 在错误情况下返回之前的数据或空数据结构，避免前端频繁重试
    const errorResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: {
        buildings: [],
        buildingData: {},
        stats: {
          totalRecords: 0,
          lastUpdateTime: Date.now(),
        }
      }
    };
    
    // 在错误情况下也设置缓存头，避免客户端立即重试
    return NextResponse.json(errorResponse, {
      headers: {
        ...corsHeaders, // 添加CORS头部
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  }
}