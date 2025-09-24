/**
 * クライアントとサーバで時刻を同期させる。
 * 同期方法については以下を参照。
 * https://xtech.nikkei.com/atcl/nxt/column/18/02381/031300003/
 */
export const computeLatencyMetricsFromTimestamps = (
  t0: number,
  t1: number,
  t2: number,
  t3: number
) => {
  const offset = (t1 - t0 + (t2 - t3)) / 2; // 時刻ずれ（server - client）
  const rtt = t3 - t0 - (t2 - t1); // server処理を控除した往復
  const serverProcMs = t2 - t1; // サーバの処理時間
  return { offset, rtt, serverProcMs };
};
