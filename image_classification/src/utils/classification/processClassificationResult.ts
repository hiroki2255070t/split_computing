import * as tf from '@tensorflow/tfjs';
import { IMAGENET_CLASSES } from '../../data/imageset';

export interface ClassificationResult {
  label: string;
  probability: number;
}

/**
 * 1. モデルの出力テンソルを、描画しやすい形式のデータに変換する関数
 * @param predictions モデルから出力された生のテンソル (logits)
 * @param labels ImageNetのクラスラベルオブジェクト
 * @param topK 上位何件の結果を取得するか (デフォルト: 5)
 * @returns {Promise<ClassificationResult[]>} ラベルと確率のペアの配列
 */
export const processOutput = async (
  predictions: tf.Tensor,
  topK = 5
): Promise<ClassificationResult[]> => {
  const labels = IMAGENET_CLASSES;
  // tf.tidyを使い、この関数内のテンソルを自動的にクリーンアップする
  const { values, indices } = tf.tidy(() => {
    // 1. softmaxを適用して、出力を確率に変換する
    const probabilities = tf.softmax(predictions);

    // 2. topkを使って、確率が最も高い上位K件の値とインデックスを取得する
    return tf.topk(probabilities, topK, true);
  });

  // テンソルから実際のデータを非同期で取り出す
  const topKIndices = (await indices.data()) as Int32Array;
  const topKValues = (await values.data()) as Float32Array;

  // メモリからテンソルを解放
  tf.dispose([values, indices]);

  // 結果を描画用のオブジェクト配列に整形する
  const results: ClassificationResult[] = [];
  for (let i = 0; i < topKIndices.length; i++) {
    const labelIndex = topKIndices[i];
    const label = labels[labelIndex] || 'Unknown';
    const probability = topKValues[i];

    results.push({
      // ラベルに複数の名前が含まれる場合、最初の名前だけを使う
      label: label.split(',')[0],
      probability,
    });
  }

  return results;
};
