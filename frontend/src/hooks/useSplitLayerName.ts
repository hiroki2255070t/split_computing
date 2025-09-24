import { useState, useCallback } from 'react';
import { modelMetadata } from '../data/models/efficientNetV2_S/metadata';

export const useSplitLayerName = ({ modelName }: { modelName: string }) => {
  if (modelName != modelMetadata.modelName) {
    throw new Error('The model specified for useSplitLayerName is not supported.');
  }
  const [splitLayerName, setSplitLayerName] = useState('');

  const handleSplitLayerNameOnValueChange = useCallback((value: number) => {
    if (value === 0) {
      setSplitLayerName('full_offload');
    } else if (value === modelMetadata.splitLayers.length + 1) {
      setSplitLayerName('no_offload');
    } else {
      setSplitLayerName(modelMetadata.splitLayers[value - 1].splitLayerName);
    }
  }, []);

  return {
    splitLayerName,
    handleSplitLayerNameOnValueChange,
  };
};
