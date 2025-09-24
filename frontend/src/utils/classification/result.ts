type TopKResult = {
  index: number;
  probability: number;
};

/**
 * ソフトマックス関数を適用してロジットを確率に変換します。
 * @param logits 推論結果の生データ (Float32Array)
 * @returns 確率分布 (Float32Array)
 */
export const softmax = (logits: Float32Array): Float32Array => {
  const maxLogit = Math.max(...logits);
  const exps = logits.map((logit) => Math.exp(logit - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b);
  return exps.map((exp) => exp / sumExps);
};

/**
 * 確率配列から上位K件の結果を取得します。
 * @param probabilities 確率分布の配列
 * @param k 取得する件数
 * @returns 上位K件の結果
 */
export const getTopK = (probabilities: Float32Array, k: number): TopKResult[] => {
  return Array.from(probabilities)
    .map((probability, index) => ({ index, probability }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, k);
};
