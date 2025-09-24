import type { ModelMetadata } from '../types';

export const modelMetadata: ModelMetadata = {
  modelName: 'EfficientNetV2-S',
  splitLayers: [
    {
      // splitLayerName:
      //   'StatefulPartitionedCall/efficientnetv2-s/blocks_6/tpu_batch_normalization_1/FusedBatchNormV3',
      splitLayerName: '/net/features/5/6/Add_output_0',
      splitLayerNameAbbreviation: 'block_6',
      featuresBytes: 589824, // [48, 48, 64]
      compressionRatio: 589824 / 1769472,
      stage: 1,
    },
    {
      splitLayerName:
        'StatefulPartitionedCall/efficientnetv2-s/blocks_10/tpu_batch_normalization_2/FusedBatchNormV3',
      splitLayerNameAbbreviation: 'block_10',
      featuresBytes: 294912, // [24, 24, 128],
      compressionRatio: 294912 / 1769472,
      stage: 2,
    },
    {
      splitLayerName:
        'StatefulPartitionedCall/efficientnetv2-s/blocks_25/tpu_batch_normalization_2/FusedBatchNormV3',
      splitLayerNameAbbreviation: 'block_25',
      featuresBytes: 147456, // [12, 12, 256]
      compressionRatio: 147456 / 1769472,
      stage: 3,
    },
    {
      splitLayerName: 'StatefulPartitionedCall/efficientnetv2-s/head/global_average_pooling2d/Mean',
      splitLayerNameAbbreviation: 'head',
      featuresBytes: 5120, // [1280]
      compressionRatio: 5120 / 1769472,
      stage: 4,
    },
  ],
};
