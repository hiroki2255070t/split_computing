import type { SeriesStats } from '../../types';

/** ====== 統計計算ヘルパー ====== */
const quantile = (sorted: number[], p: number): number => {
  const n = sorted.length;
  if (n === 0) return NaN;
  const pos = (n - 1) * p;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  const w = pos - lo;
  return sorted[lo] + w * (sorted[hi] - sorted[lo]);
};

type StatsOptions = {
  /** 外れ値除外の有無（デフォルト: true） */
  excludeOutliers?: boolean;
  /** Tukey の係数 k（デフォルト: 1.5） */
  k?: number;
};

/**
 * 値配列から統計量を計算。
 * 既定で 1.5×IQR ルールに基づく外れ値を除外してから算出します。
 * 異常に厳しいしきい値で全消滅した場合は、外れ値除外を行わずに算出します。
 */
export const computeSeriesStats = (values: number[], options: StatsOptions = {}): SeriesStats => {
  const { excludeOutliers = true, k = 1.5 } = options;

  // 非数/無限大を除去
  const base = values.filter((v) => Number.isFinite(v));
  const n0 = base.length;
  if (n0 === 0) {
    return {
      count: 0,
      mean: NaN,
      std: NaN,
      min: NaN,
      q1: NaN,
      median: NaN,
      q3: NaN,
      max: NaN,
    };
  }

  const sorted0 = [...base].sort((a, b) => a - b);

  // まず元データで Q1/Q3/IQR を計算し、Tukey のフェンスを作成
  let arr = sorted0;
  if (excludeOutliers) {
    const q1_0 = quantile(sorted0, 0.25);
    const q3_0 = quantile(sorted0, 0.75);
    const iqr0 = q3_0 - q1_0;
    const lowerFence = q1_0 - k * iqr0;
    const upperFence = q3_0 + k * iqr0;

    const filtered = sorted0.filter((v) => v >= lowerFence && v <= upperFence);

    // すべて落ちた/1件も残らない等の時はフォールバック（除外しない）
    if (filtered.length > 0) {
      arr = filtered;
    }
  }

  const n = arr.length;
  const sum = arr.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const variance = n > 1 ? arr.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (n - 1) : 0;
  const std = Math.sqrt(variance);

  // 以降は「外れ値を除外後の配列」から 5 数要約を算出
  const sorted = [...arr].sort((a, b) => a - b);

  return {
    count: n,
    mean,
    std,
    min: sorted[0], // whisker 下端（非外れ値の最小）
    q1: quantile(sorted, 0.25),
    median: quantile(sorted, 0.5),
    q3: quantile(sorted, 0.75),
    max: sorted[n - 1], // whisker 上端（非外れ値の最大）
  };
};
