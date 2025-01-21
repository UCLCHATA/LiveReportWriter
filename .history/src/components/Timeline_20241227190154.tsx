import React from 'react';

export const Timeline: React.FC = () => {
  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-500">Timeline</span>
          <div className="h-1 w-32 bg-gray-200 rounded">
            <div className="h-full w-1/2 bg-green-500 rounded" />
          </div>
        </div>
        <div className="text-sm text-gray-500">4/8 completed</div>
      </div>
    </div>
  );
}; 