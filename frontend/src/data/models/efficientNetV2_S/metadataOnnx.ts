import type { ModelMetadata } from '../types';

export const modelMetadata: ModelMetadata = {
  modelName: 'EfficientNetV2-S', // 入力画像の形状は[3, 384, 384], データサイズは1769472bytes
  splitLayers: [
    {
      splitLayerName: '/features/features.3/features.3.1/Add_output_0',
      splitLayerNameAbbreviation: 'block_3',
      featuresBytes: 589824, // [48, 48, 64]
      compressionRatio: 589824 / 1769472,
      stage: 1,
    },
    {
      splitLayerName: '/features/features.4/features.4.1/Add_output_0',
      splitLayerNameAbbreviation: 'block_4',
      featuresBytes: 294912, // [24, 24, 128],
      compressionRatio: 294912 / 1769472,
      stage: 2,
    },
    {
      splitLayerName: '/features/features.6/features.6.1/Add_output_0',
      splitLayerNameAbbreviation: 'block_6',
      featuresBytes: 147456, // [12, 12, 256]
      compressionRatio: 147456 / 1769472,
      stage: 3,
    },
  ],
};
