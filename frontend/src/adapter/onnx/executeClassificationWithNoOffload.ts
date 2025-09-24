import * as ort from 'onnxruntime-web';
import type { ExecuteClassificationWithNoOffloadResult } from '../classificationExecutor';
import { softmax, getTopK } from '../../utils/classification/result';
/**
 * onnxruntime-web を使用して、デバイス上でモデルの一部を推論（オフロード）します。
 * @param session ロード済みの ort.InferenceSession
 * @param inputTensor 入力画像データから作成されたテンソル
 * @param splitLayerName 中間特徴量を出力するONNX Graphのノード名
 * @returns 中間特徴量のテンソルと、デバイス上での推論時間
 */
export const executeClassificationWithNoOffload = async ({
  session,
  pixelData,
  tensorShape,
}: {
  session: ort.InferenceSession;
  pixelData: Float32Array<ArrayBuffer>;
  tensorShape: number[];
}): Promise<ExecuteClassificationWithNoOffloadResult> => {
  // デバイスでの推論時間を計測
  const t0 = performance.now();

  const inputTensor = new ort.Tensor('float32', pixelData, tensorShape);

  const feeds = { [session.inputNames[0]]: inputTensor };

  const results = await session.run(feeds);

  // バックエンドモデルの出力層の名前を取得（通常は1つ）
  const outputLayerName = session.outputNames[0];
  const outputTensor = results[outputLayerName];

  // 推論結果（ロジット）に後処理を適用
  const probabilities = softmax(outputTensor.data as Float32Array);
  const top5 = getTopK(probabilities, 5);

  const t1 = performance.now();
  const inferenceTimeOnDevice = t1 - t0;

  return { top5, inferenceTimeOnDevice };
};
