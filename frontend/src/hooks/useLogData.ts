import { useState, useCallback } from 'react';
import type { LogDataElement } from '../types';
import { downloadJson } from '../utils/downloadJson';
import { type AnalyzeLogDataResult } from '../types';
import { computeSeriesStats } from '../utils/analysis/boxplot';
import { computeLatencyMetricsFromTimestamps } from '../utils/time';

/**
 * useLogData
 * ログ（推論時間や通信レイテンシなどの計測結果）を管理するためのカスタムフック。
 * - 追加/クリア/表示（console 出力）/JSON 保存/統計分析のユーティリティを提供します。
 */
export const useLogData = () => {
  // ログ配列のステート。1 要素が 1 回の実行計測結果を表す想定
  const [logData, setLogData] = useState<LogDataElement[]>([]);

  /**
   * 1 件のログ要素を末尾に追加
   */
  const pushLogDataElement = useCallback((newLogDataElement: LogDataElement) => {
    setLogData((prev) => [...prev, newLogDataElement]);
  }, []);

  /**
   * すべてのログをクリア
   */
  const clearLogData = useCallback(() => {
    setLogData([]);
  }, []);

  /**
   * 指定したログ要素の計測値をコンソールに出力
   */
  const showLogDataElement = useCallback((logDataElement: LogDataElement) => {
    const latencyMetrics = computeLatencyMetricsFromTimestamps(
      logDataElement.clientMessageSentTimestamp,
      logDataElement.serverMessageReceivedTimestamp,
      logDataElement.serverResponseSentTimestamp,
      logDataElement.clientResponseReceivedTimestamp
    );

    // デバイス上での総実行時間: 実行開始→メッセージ送信まで
    const executionTimeOnDevice =
      logDataElement.clientMessageSentTimestamp - logDataElement.clientExecuteStartTimestamp;

    // サーバー上での総実行時間: リクエスト受信→レスポンス送信まで
    const executionTimeOnServer =
      logDataElement.serverResponseSentTimestamp - logDataElement.serverMessageReceivedTimestamp;

    // 画像分類プロセス全体の総実行時間：実行開始→結果の取得まで
    const executionTimeSum = latencyMetrics.rtt + executionTimeOnDevice + executionTimeOnServer;

    // 主要なメトリクスを整形して出力
    console.log(`🐤 分割点：${logDataElement.splitLayerName}`);
    console.log(`🐊 推論時間(デバイス): ${logDataElement.inferenceTimeOnDevice.toFixed(2)}ms`);
    console.log(`🐊 推論時間(リモート): ${logDataElement.inferenceTimeOnRemote.toFixed(2)}ms`);
    console.log(`🦊 総実行時間(デバイス): ${executionTimeOnDevice.toFixed(2)}ms`);
    console.log(`🦊 総実行時間(リモート): ${executionTimeOnServer.toFixed(2)}ms`);
    console.log(`🕊️ 通信時間(往復): ${latencyMetrics.rtt.toFixed(2)}ms`);
    console.log(`🐙 総実行時間(システム全体): ${executionTimeSum.toFixed(2)}ms`);
  }, []);

  /**
   * ログを splitLayerName ごとに集計し、箱ひげ図に必要な統計値などを返す
   * - 返り値は可視化層でそのまま利用可能（box plot の 5 数要約 + 平均/標準偏差/件数）
   * - 可視化は別関数/コンポーネントで実装してください
   */
  const analyzeLogData = useCallback((): AnalyzeLogDataResult => {
    // 1) 前処理: 必要な値だけ抽出
    const cleaned = logData.map((row) => {
      const latency = computeLatencyMetricsFromTimestamps(
        row.clientMessageSentTimestamp,
        row.serverMessageReceivedTimestamp,
        row.serverResponseSentTimestamp,
        row.clientResponseReceivedTimestamp
      );
      const executionTimeOnDevice =
        row.clientMessageSentTimestamp - row.clientExecuteStartTimestamp;
      const executionTimeOnServer =
        row.serverResponseSentTimestamp - row.serverMessageReceivedTimestamp;

      const executionTimeSum = latency.rtt + executionTimeOnDevice + executionTimeOnServer;

      return {
        splitLayerName: row.splitLayerName,
        rtt: latency.rtt,
        executionTimeOnDevice,
        executionTimeOnServer,
        executionTimeSum,
      };
    });

    // 2) グルーピング: splitLayerName => 各メトリクスの配列
    const grouped = cleaned.reduce<
      Record<
        string,
        {
          rtt: number[];
          executionTimeOnDevice: number[];
          executionTimeOnServer: number[];
          executionTimeSum: number[];
        }
      >
    >((acc, cur) => {
      const key = cur.splitLayerName;
      if (!acc[key]) {
        acc[key] = {
          rtt: [],
          executionTimeOnDevice: [],
          executionTimeOnServer: [],
          executionTimeSum: [],
        };
      }
      acc[key].rtt.push(cur.rtt);
      acc[key].executionTimeOnDevice.push(cur.executionTimeOnDevice);
      acc[key].executionTimeOnServer.push(cur.executionTimeOnServer);
      acc[key].executionTimeSum.push(cur.executionTimeSum);
      return acc;
    }, {});

    // 3) 統計値の計算
    const byLayer: AnalyzeLogDataResult['byLayer'] = {};
    for (const [splitLayerName, series] of Object.entries(grouped)) {
      byLayer[splitLayerName] = {
        splitLayerName,
        rtt: computeSeriesStats(series.rtt),
        executionTimeOnDevice: computeSeriesStats(series.executionTimeOnDevice),
        executionTimeOnServer: computeSeriesStats(series.executionTimeOnServer),
        executionTimeSum: computeSeriesStats(series.executionTimeSum),
      };
    }

    console.log('byLayer: %o', byLayer);

    return { byLayer };
  }, [logData]);

  /**
   * logData を JSON としてダウンロード保存する
   * @param fileName 任意。未指定ならタイムスタンプ付きのデフォルト名を使用
   *
   * - downloadJson はオブジェクトを JSON 文字列化し、Blob/URL を生成して
   *   <a download> をクリックして保存させるユーティリティです（ブラウザのみ）
   */
  const saveLogDataAsJson = useCallback(
    (fileName?: string) => {
      // デフォルトのファイル名（例: logs-2025-09-09-142305.json）を生成
      const buildDefaultLogFileName = () => {
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
        return `logs-${stamp}.json`;
      };

      downloadJson(logData as unknown as object, fileName ?? buildDefaultLogFileName());
    },
    [logData]
  );

  const saveAnalyzedDataAsJson = useCallback(
    (fileName?: string) => {
      const analyzedData = analyzeLogData();
      // デフォルトのファイル名（例: logs-2025-09-09-142305.json）を生成
      const buildDefaultLogFileName = () => {
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
        return `analyze-${stamp}.json`;
      };

      downloadJson(analyzedData as unknown as object, fileName ?? buildDefaultLogFileName());
    },
    [analyzeLogData]
  );

  // フックのパブリック API
  return {
    logData,
    pushLogDataElement,
    clearLogData,
    showLogDataElement,
    analyzeLogData,
    saveLogDataAsJson,
    saveAnalyzedDataAsJson,
  };
};
