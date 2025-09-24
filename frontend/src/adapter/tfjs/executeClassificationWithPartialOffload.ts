import * as tf from '@tensorflow/tfjs';
import type {
  ExecuteClassificationWithPartialOffloadResult,
} from '../classificationExecutor';

export const executeClassificationWithPartialOffload = async ({
  model,
  pixelData,
  tensorShape,
  splitLayerName,
}: {
  model: tf.GraphModel;
  pixelData: Float32Array<ArrayBuffer>;
  tensorShape: number[];
  splitLayerName: string;
}): Promise<ExecuteClassificationWithPartialOffloadResult> => {
  // デバイスでの推論時間を計測
  const t0 = performance.now();

  const inputTensor = tf.tensor(pixelData, tensorShape, 'float32');

  // モデルを分割して前半の推論を実行
  const middleTensor = model.execute(inputTensor, splitLayerName) as tf.Tensor;
  const middleTensorShape = middleTensor.shape;
  const middleTensorData = (await middleTensor.data()) as Float32Array;

  const t1 = performance.now();
  const inferenceTimeOnDevice = t1 - t0;

  tf.dispose([inputTensor, middleTensor]);

  return { middleTensorData, middleTensorShape, inferenceTimeOnDevice };
};
