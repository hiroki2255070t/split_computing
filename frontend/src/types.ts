import z from 'zod';

// 研究に必要なデータ
export const LogDataElementSchema = z.object({
  splitLayerName: z.string(), // 分割点
  inferenceTimeOnDevice: z.number(), // デバイスでの推論実行時間
  inferenceTimeOnRemote: z.number(), // リモートサーバでの推論実行時間
  clientExecuteStartTimestamp: z.number(), // デバイスが全体の処理を始めた時刻（デバイスでの処理を開始した時刻）
  clientMessageSentTimestamp: z.number(), // Webアプリがメッセージを送信した時刻（デバイスでの処理が完了した時刻＆上り通信を開始した時刻）
  clientResponseReceivedTimestamp: z.number(), //Wbアプリがレスポンスを受信した時刻（下り通信が完了した時刻）
  serverMessageReceivedTimestamp: z.number(), // WebSocketサーバがメッセージを受信した時刻（上り通信が完了した時刻＆サーバでの処理を開始した時刻）
  serverResponseSentTimestamp: z.number(), // WebSocketサーバがレスポンスを送信した時刻（サーバでの処理が終了した時刻＆下り通信を開始した時刻）
});
export type LogDataElement = z.infer<typeof LogDataElementSchema>;

/** ====== 統計用型 ====== */
type BoxStats = {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
};
export type SeriesStats = BoxStats & {
  count: number;
  mean: number;
  /** 標本標準偏差 (n-1) */
  std: number;
};
export type AnalyzeLogDataResult = {
  byLayer: Record<
    string,
    {
      splitLayerName: string;
      rtt: SeriesStats;
      executionTimeOnDevice: SeriesStats;
      executionTimeOnServer: SeriesStats;
      executionTimeSum: SeriesStats;
    }
  >;
};
