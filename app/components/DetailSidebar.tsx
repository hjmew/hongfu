import React from 'react';
import { TableRecord } from '../types';

interface DetailSidebarProps {
  isOpen: boolean;
  records: TableRecord[];
  onClose: () => void;
}

const DetailSidebar: React.FC<DetailSidebarProps> = ({ isOpen, records, onClose }) => {
  // 如果没有选择记录，显示提示信息
  if (!isOpen || records.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无数据</h3>
          <p className="mt-1 text-sm text-gray-500">请点击表格中的单元格查看详情</p>
        </div>
      </div>
    );
  }

  // 获取安全状态颜色
  const getStatusColor = (status: string) => {
    if (status.includes('安全')) {
      return 'bg-status-safe';
    } else if (status.includes('危险')) {
      return 'bg-status-danger';
    } else if (status.includes('生命危险')) {
      return 'bg-status-emergency';
    }
    return 'bg-gray-500';
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">详情信息</h3>
        <p className="text-sm text-gray-500 mt-1">
          共 {records.length} 条记录
        </p>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {records.map((record, index) => {
          const { 安全状态, 受伤情况, 特殊情况, 补充说明, 提交时间, 提交人, 楼栋号, 楼层, 房号 } = record.fields;
          
          return (
            <div key={record.record_id} className="p-4 border-b last:border-b-0">
              <div className="flex items-center mb-3">
                <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(安全状态)}`}></div>
                <h4 className="font-medium text-gray-900">{安全状态}</h4>
                <span className="ml-auto text-sm text-gray-500">{formatTime(提交时间)}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-gray-700">位置：</span>
                  <span className="text-gray-900">{楼栋号}{楼层}{房号}</span>
                </p>
                
                <p>
                  <span className="font-medium text-gray-700">提交人：</span>
                  <span className="text-gray-900">{提交人?.[0]?.name || '未知'}</span>
                </p>
                
                {受伤情况 && (
                  <p>
                    <span className="font-medium text-gray-700">受伤情况：</span>
                    <span className="text-gray-900">{受伤情况}</span>
                  </p>
                )}
                
                {特殊情况 && 特殊情况.length > 0 && (
                  <p>
                    <span className="font-medium text-gray-700">特殊情况：</span>
                    <span className="text-gray-900">{特殊情况.join('、')}</span>
                  </p>
                )}
                
                {补充说明 && 补充说明.length > 0 && (
                  <p>
                    <span className="font-medium text-gray-700">补充说明：</span>
                    <span className="text-gray-900">
                      {补充说明.map((item, idx) => (
                        <span key={idx}>{item.text}</span>
                      ))}
                    </span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DetailSidebar;