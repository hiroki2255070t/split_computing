import React from 'react';

// コンポーネントのPropsの型を定義
type TabSelectorProps = {
  selectedValue: number;
  numberOfTabs: number;
  onTabClick: (value: number) => void;
  whatShowed: (value: number) => string;
};

const TabSelector: React.FC<TabSelectorProps> = ({
  selectedValue,
  numberOfTabs,
  onTabClick,
  whatShowed,
}) => {
  const tabValues = Array.from({ length: numberOfTabs }, (_, i) => i);

  return (
    <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg m-2">
      {tabValues.map((value) => (
        <button
          key={value}
          onClick={() => onTabClick(value)}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out
            ${
              selectedValue === value
                ? 'bg-blue-500 text-white shadow' // 選択されているタブのスタイル
                : 'bg-transparent text-gray-600 hover:bg-gray-300' // 選択されていないタブのスタイル
            }
          `}
        >
          {whatShowed(value)}
        </button>
      ))}
    </div>
  );
};

export default TabSelector;
