import React from 'react';
import { DataStats } from '../types';

interface HeaderProps {
  stats: DataStats;
  submitUrl: string;
}

const Header: React.FC<HeaderProps> = ({ stats, submitUrl }) => {
  // 格式化最后更新时间
  const formatLastUpdateTime = (timestamp: number) => {
    if (!timestamp) {
      return '暂无数据';
    }
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
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">报平安系统</h1>
        {submitUrl && (
          <button
            onClick={() => window.open(submitUrl, '_blank')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            我要提交信息
          </button>
        )}
      </div>
      <div className="text-sm text-gray-600">
        共 {stats.totalRecords} 条数据，最后更新时间：{formatLastUpdateTime(stats.lastUpdateTime)}
      </div>
    </div>
  );
};

export default Header;