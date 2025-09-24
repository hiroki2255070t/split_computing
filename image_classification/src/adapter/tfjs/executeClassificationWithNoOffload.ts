import * as tf from '@tensorflow/tfjs';
import type {
  TopKResult,
  ExecuteClassificationWithNoOffloadResult,
} from '../classificationExecutor';

export const executeClassificationWithNoOffload = async ({
  model,
  pixelData,
  tensorShape,
}: {
  model: tf.GraphModel;
  pixelData: Float32Array<ArrayBuffer>;
  tensorShape: number[];
}): Promise<ExecuteClassificationWithNoOffloadResult> => {
  const t0 = performance.now();

  const inputTensor = tf.tensor(pixelData, tensorShape, 'float32');

  // 1. tf.tidy()から、上位5件の「値」と「インデックス」のテンソルを返す
  const { values, indices } = tf.tidy(() => {
    const outputTensor = model.execute(inputTensor) as tf.Tensor;

    // Softmaxを適用してロジットを確率に変換する
    const probabilities = tf.softmax(outputTensor);

    // 出力された確率から上位5件の値（values）とインデックス（indices）を取得
    // trueを指定することで、結果が値の降順でソートされる
    const topkResult = tf.topk(probabilities, 5, true);

    // 2つのテンソルをオブジェクトとして返す
    return topkResult;
  });

  // 2. 両方のテンソルから同時にデータを非同期で抽出
  const [top5Values, top5Indices] = await Promise.all([
    values.data() as Promise<Float32Array>,
    indices.data() as Promise<Int32Array>,
  ]);

  const t1 = performance.now();
  const inferenceTimeOnDevice = t1 - t0;

  // 3. データ抽出後に不要になったテンソルを明示的に破棄
  tf.dispose([inputTensor, values, indices]);

  // 4. 最終的な返り値の形式に整形
  const top5: TopKResult[] = Array.from(top5Indices).map((index, i) => ({
    index: index,
    probability: top5Values[i],
  }));

  return {
    top5,
    inferenceTimeOnDevice,
  };
};
