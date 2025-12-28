'use client';

import React, { useState, useEffect } from 'react';
import BuildingTabs from './components/BuildingTabs';
import StatusTable from './components/StatusTable';
import DetailSidebar from './components/DetailSidebar';
import Header from './components/Header';
import { BuildingData, CellStatus, DataStats, TableRecord } from './types';

// 初始数据统计
const initialStats: DataStats = {
  totalRecords: 0,
  lastUpdateTime: 0,
};

const Home: React.FC = () => {
  // 状态管理
  const [buildingData, setBuildingData] = useState<BuildingData>({});
  const [buildings, setBuildings] = useState<string[]>([]);
  const [activeBuilding, setActiveBuilding] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedRecords, setSelectedRecords] = useState<TableRecord[]>([]);
  const [stats, setStats] = useState<DataStats>(initialStats);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialLoad, setHasInitialLoad] = useState<boolean>(false); // 添加初始加载状态

  // 获取数据
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 直接调用飞书API，而不是通过内部API路由
      // 注意：这需要后端API支持CORS或使用代理
      const response = await fetch('/api/feishu/data', {
        cache: 'no-store',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBuildingData(data.data.buildingData);
        setBuildings(data.data.buildings);
        setStats(data.data.stats);
        
        // 设置默认激活的楼栋
        if (data.data.buildings.length > 0 && !activeBuilding) {
          setActiveBuilding(data.data.buildings[0]);
        }
        setHasInitialLoad(true); // 标记已初始加载
      } else {
        setError('获取数据失败');
      }
    } catch (err) {
      setError('获取数据出错');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载数据 - 只执行一次
  useEffect(() => {
    fetchData();
    
    // 设置定期更新（每30秒更新一次），避免频繁刷新
    const refreshInterval = setInterval(() => {
      if (hasInitialLoad) { // 只有在初次加载成功后才进行定期更新
        fetchData();
      }
    }, 30000); // 30秒更新一次
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []); // 空依赖数组，确保只在组件挂载时执行一次

  // 处理楼栋切换
  const handleBuildingChange = (building: string) => {
    setActiveBuilding(building);
  };

  // 处理单元格点击
  const handleCellClick = (cellData: CellStatus) => {
    setSelectedRecords(cellData.records);
    setSidebarOpen(true);
  };

  // 关闭侧边栏
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6 lg:p-8">
      {/* 头部 */}
      <Header stats={stats} submitUrl={process.env.NEXT_PUBLIC_SUBMIT_URL || ''} />
      
      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* 主内容区域 - 表格和详情并排显示 */}
      <div className="flex gap-6">
        {/* 状态表格 - 占据左侧空间 */}
        <div className="flex-1">
          <StatusTable
            buildingData={buildingData}
            buildings={buildings}
            activeBuilding={activeBuilding}
            onBuildingChange={handleBuildingChange}
            onCellClick={handleCellClick}
            isLoading={isLoading}
          />
        </div>
        
        {/* 详情面板 - 固定在右侧 */}
        <div className="w-96">
          <DetailSidebar
            isOpen={sidebarOpen}
            records={selectedRecords}
            onClose={handleCloseSidebar}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;