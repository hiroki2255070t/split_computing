import * as ort from "onnxruntime-node";
import { softmax, getTopK } from "../../utils/result";

type TopKResult = {
  index: number;
  probability: number;
};

/**
 * 中間特徴量を受け取り、ONNXモデルで推論を実行して分類結果を返します。
 * @param session ロード済みの ort.InferenceSession
 * @param features フロントエンドから受信した中間特徴量
 * @param shape 特徴量の元の形状
 * @param splitLayerName ONNX Graph の入力ノード名（分割点の入力名）
 * @returns 分類結果の上位5件（インデックスと信頼度）の配列
 */
export const executeClassification = async (
  session: ort.InferenceSession,
  features: Float32Array,
  shape: number[],
  splitLayerName: string
): Promise<{ top5: TopKResult[]; inferenceTimeOnRemote: number }> => {
  if (!session) {
    throw new Error("セッションが引数として渡されていません。");
  }

  // リモートサーバでの推論実行時間を計測
  const t0 = performance.now();

  // 1. 入力テンソルを作成
  const inputTensor = new ort.Tensor("float32", features, shape);

  // 2. 推論の実行
  //   tf.jsの model.execute({[name]: tensor}) と同様に、
  //   入力名をキーとするオブジェクトでテンソルを渡します。
  const feeds = { [splitLayerName]: inputTensor };
  const results = await session.run(feeds);

  // バックエンドモデルの出力層の名前を取得（通常は1つ）
  const outputLayerName = session.outputNames[0];
  const outputTensor = results[outputLayerName];

  // 3. 推論結果（ロジット）に後処理を適用
  const probabilities = softmax(outputTensor.data as Float32Array);
  const top5 = getTopK(probabilities, 5);

  const t1 = performance.now();
  const inferenceTimeOnRemote = t1 - t0;

  return {
    top5,
    inferenceTimeOnRemote,
  };
};
