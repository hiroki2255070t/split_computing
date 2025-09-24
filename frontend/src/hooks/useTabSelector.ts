import { useState } from 'react';

/**
 * タブ選択の状態とロジックを管理するカスタムフック
 * @param
 * initialValue: number - 選択肢の初期値
 * @returns {
 * selectedValue: 現在選択されている値,
 * handleTabClick: 選択肢をクリックした際のハンドラ関数
 * }
 */
export const useTabSelector = (
  initialValue: number
): { selectedValue: number; handleTabClick: (value: number) => void } => {
  const [selectedValue, setSelectedValue] = useState<number>(initialValue);

  const handleTabClick = (value: number) => {
    setSelectedValue(value);
  };

  return {
    selectedValue,
    handleTabClick,
  };
};
