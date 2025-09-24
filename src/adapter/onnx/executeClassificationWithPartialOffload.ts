import * as ort from 'onnxruntime-web';
import type { ExecuteClassificationWithPartialOffloadResult } from '../classificationExecutor';

/**
 * onnxruntime-web を使用して、デバイス上でモデルの一部を推論（オフロード）します。
 * @param session ロード済みの ort.InferenceSession
 * @param inputTensor 入力画像データから作成されたテンソル
 * @param splitLayerName 中間特徴量を出力するONNX Graphのノード名
 * @returns 中間特徴量のテンソルと、デバイス上での推論時間
 */
export const executeClassificationWithPartialOffload = async ({
  session,
  pixelData,
  tensorShape,
  splitLayerName,
}: {
  session: ort.InferenceSession;
  pixelData: Float32Array<ArrayBuffer>;
  tensorShape: number[];
  splitLayerName: string;
}): Promise<ExecuteClassificationWithPartialOffloadResult> => {
  // デバイスでの推論時間を計測
  const t0 = performance.now();

  const inputTensor = new ort.Tensor('float32', pixelData, tensorShape);

  // onnxruntime-webでは、session.run()の第2引数で出力ノードを指定できる。
  // これにより、モデルの途中にあるレイヤーから中間特徴量を直接取り出すことが可能。
  //   - 第1引数: 入力。{ "入力ノード名": 入力テンソル } の形式
  //   - 第2引数: 出力。{ "出力させたいノード名": null } の形式
  const feeds = { [session.inputNames[0]]: inputTensor };
  const fetches = { [splitLayerName]: null };

  const results = await session.run(feeds, fetches);
  const middleTensor = results[splitLayerName];
  const middleTensorShape = Array.from(middleTensor.dims);
  const middleTensorData = middleTensor.data as Float32Array;

  const t1 = performance.now();
  const inferenceTimeOnDevice = t1 - t0;

  return { middleTensorData, middleTensorShape, inferenceTimeOnDevice };
};
