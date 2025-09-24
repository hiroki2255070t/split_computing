import * as tf from '@tensorflow/tfjs';
import type { ExecuteClassificationProps, ExecuteClassificationResult } from '../types';

export const mockExecuteClassification = async ({
  middleTensor,
  splitLayerName,
}: ExecuteClassificationProps): Promise<ExecuteClassificationResult> => {
  const modelPath = '/model/efficientnet_b0/model.json';

  const model = await tf.loadGraphModel(modelPath);

  const startTime = performance.now();
  const predictions = model.execute({
    [splitLayerName]: middleTensor,
  }) as tf.Tensor;
  const endTime = performance.now();
  const duration = endTime - startTime;

  return { predictions, remoteExecutionTime: duration };
};
