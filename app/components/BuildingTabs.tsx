import React from 'react';

interface BuildingTabsProps {
  buildings: string[];
  activeBuilding: string;
  onBuildingChange: (building: string) => void;
}

const BuildingTabs: React.FC<BuildingTabsProps> = ({ buildings, activeBuilding, onBuildingChange }) => {
  return (
    <div className="mb-4 overflow-x-auto">
      <div className="flex space-x-2 pb-2">
        {buildings.map((building) => (
          <button
            key={building}
            onClick={() => onBuildingChange(building)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeBuilding === building
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {building}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BuildingTabs;