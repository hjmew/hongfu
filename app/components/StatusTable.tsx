import React from 'react';
import { BuildingData, CellStatus } from '../types';

interface StatusTableProps {
  buildingData: BuildingData;
  buildings: string[];
  activeBuilding: string;
  onBuildingChange: (building: string) => void;
  onCellClick: (cellData: CellStatus) => void;
  isLoading: boolean;
}

const StatusTable: React.FC<StatusTableProps> = ({ buildingData, buildings, activeBuilding, onBuildingChange, onCellClick, isLoading }) => {
  // 获取所有楼栋的数据，按楼栋名称排序
  const sortedBuildings = buildings.sort();
  
  // 预定义的楼层和房间号范围（确保显示所有可能的楼层和房间）
  const predefinedFloors = ['1楼', '2楼', '3楼', '4楼', '5楼', '6楼', '7楼', '8楼'];
  const predefinedRooms = ['1号', '2号', '3号', '4号'];
  
  // 收集实际存在的楼层和房号，用于数据匹配
  const allFloors = new Set<string>();
  const allRooms = new Set<string>();
  
  // 遍历所有楼栋，收集实际存在的楼层和房号
  sortedBuildings.forEach(building => {
    const currentBuildingData = buildingData[building] || {};
    const floors = Object.keys(currentBuildingData);
    floors.forEach(floor => {
      allFloors.add(floor);
      const floorData = currentBuildingData[floor] || {};
      const rooms = Object.keys(floorData);
      rooms.forEach(room => allRooms.add(room));
    });
  });
  
  // 使用预定义的楼层和房间号，确保显示所有可能的单元格
  const floors = predefinedFloors;
  const rooms = predefinedRooms;
  
  // 获取状态显示文本和颜色
  const getStatusInfo = (cellData: CellStatus | undefined) => {
    if (!cellData) {
      return { text: '无数据', color: 'bg-gray-200 text-gray-500' };
    }
    
    switch (cellData.status) {
      case 'safe':
        return { text: '安全', color: 'bg-green-500 text-white' };
      case 'danger':
        return { text: '危险', color: 'bg-red-500 text-white' };
      case 'emergency':
        return { text: '紧急', color: 'bg-red-700 text-white' };
      default:
        return { text: '无数据', color: 'bg-gray-200 text-gray-500' };
    }
  };
  
  // 骨架屏渲染
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="w-20 border p-2 bg-gray-50 text-left">楼层</th>
              {rooms.map((room, index) => (
                <th key={room} className="w-20 border p-2 bg-gray-50 text-center">
                  <div className="skeleton h-6 bg-gray-200 rounded"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array(10).fill(0).map((_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="border p-2 bg-gray-50 font-medium">
                  <div className="skeleton h-6 bg-gray-200 rounded"></div>
                </td>
                {rooms.map((room, colIndex) => (
                  <td key={colIndex} className="border p-2">
                    <div className="skeleton h-16 w-full bg-gray-200 rounded"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* 楼栋按钮行 */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-gray-700">楼栋选择：</span>
        
        {sortedBuildings.map(building => (
          <button
            key={building}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeBuilding === building
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => onBuildingChange(building)}
          >
            {building}
          </button>
        ))}
      </div>
      
      {/* 主表格 - 楼层为行，房间号为列 */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="w-20 border p-2 bg-gray-50 text-left font-semibold">楼层</th>
              {rooms.map(room => (
                <th key={room} className="w-20 border p-2 bg-gray-50 text-center font-semibold">
                  {room}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {floors.map(floor => (
              <tr key={floor}>
                <td className="border p-2 bg-gray-50 font-medium">
                  {floor}
                </td>
                {rooms.map(room => {
                  // 查找该楼层该房间号的数据（只从当前选中的楼栋中查找）
                  const currentBuildingData = buildingData[activeBuilding] || {};
                  const floorData = currentBuildingData[floor] || {};
                  const cellData = floorData[room];
                  
                  const statusInfo = getStatusInfo(cellData);
                  
                  return (
                    <td
                      key={room}
                      onClick={() => cellData && onCellClick(cellData)}
                      className={`border p-2 text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${statusInfo.color}`}
                      title={cellData ? `点击查看${activeBuilding}${floor}${room}详情` : '无数据'}
                    >
                      <div className="text-xs">
                        <div className="font-medium">{statusInfo.text}</div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 表格说明 */}
      <div className="text-sm text-gray-600">
        <p>• 表格显示所有可能的楼层（1楼-8楼）和房间号（1号-4号）</p>
        <p>• 点击楼栋按钮可以切换显示不同楼栋的数据</p>
        <p>• 点击单元格可以查看详细记录</p>
      </div>
    </div>
  );
};

export default StatusTable;