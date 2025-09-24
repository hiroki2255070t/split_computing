// image_classificationレポジトリ及びimage_classification_backendレポジトリで共通

import * as tf from '@tensorflow/tfjs';
import { z } from 'zod';

export type ExecuteClassificationProps = {
  middleTensor: tf.Tensor<tf.Rank>;
  splitLayerName: string;
};

export type ExecuteClassificationResult = {
  predictions: tf.Tensor<tf.Rank>;
  remoteExecutionTime: number;
};

// WebSocketを通じてフロントエンドからバックエンドに送信されるメタデータのZodスキーマ
export const WsMessageMetadataSchema = z.object({
  // .array() 定義し、.min(1)で空配列を禁止することで、1〜N次元のshapeに対応
  shape: z.array(z.number().int()).min(1),
  splitLayerName: z.string(), // 分割点に相当する層の名前(model.jsonから取得)
  inferenceTimeOnDevice: z.number(), // デバイスでの推論実行時間
  clientExecuteStartTimestamp: z.number(), // デバイスが全体の処理を始めた時刻
  clientMessageSentTimestamp: z.number(), // デバイスがメッセージを送信した時刻
});

export type WsMessageMetadata = z.infer<typeof WsMessageMetadataSchema>;
export function parseAsMessageMetadata(data: unknown): WsMessageMetadata {
  return WsMessageMetadataSchema.parse(data);
}

/**
 * 1. Zodスキーマの定義
 *
 * フロントエンドからバックエンドへ送信されるWebSocketメッセージのZodスキーマ。
 * - `features`: 数値の3次元配列として受信。
 * - `shape`: `features`の元の形状（例: [56, 56, 3]）。推論時のTensor復元に必要。
 * - `splitLayerName`: 分割点
 *
 * `.transform()` を使い、バリデーション成功後に `features` を
 * `Float32Array` へと自動的に変換します。
 */
export const WsMessageSchema = z
  .object({
    features: z.array(z.array(z.array(z.array(z.number())))),
    wsMessageMetadata: WsMessageMetadataSchema,
  })
  .transform((data) => {
    // 検証済みの多次元配列をフラット化し、Float32Arrayに変換
    const flattenedFeatures = data.features.flat(3);
    return {
      features: new Float32Array(flattenedFeatures),
      wsMessageMetadata: data.wsMessageMetadata,
    };
  });

/**
 * 2. タイプの宣言
 *
 * transform後の型が自動的に推論されます。
 * 結果として、`WsMessage`の`features`プロパティの型は`Float32Array`になります。
 *
 * 推論される型:
 * {
 *  features: Float32Array;
 *  shape: [number, number, number];
 *  splitLayerName: string
 * }
 */
export type WsMessage = z.infer<typeof WsMessageSchema>;

/**
 * 3. パース関数の実装
 *
 * この関数が返すオブジェクトの`features`は、
 * すでにFloat32Arrayに変換されています。
 */
export function parseAsWsMessage(data: unknown): WsMessage {
  return WsMessageSchema.parse(data);
}

// 1. Zodスキーマの定義
// オブジェクトの各プロパティの型を定義します。
// indexは整数、probabilityは一般的な数値として定義するのが適切です。
export const WsResponseSchema = z.object({
  top5: z.array(
    z.object({
      index: z.number().int(), // indexは整数
      probability: z.number(), // probabilityは浮動小数点数を含む数値
    })
  ),
  splitLayerName: z.string(),
  inferenceTimeOnDevice: z.number(), // デバイスでの推論実行時間
  inferenceTimeOnRemote: z.number(), // リモートサーバでの推論実行時間
  clientExecuteStartTimestamp: z.number(), // デバイスが全体の処理を始めた時刻（デバイスでの処理を開始した時刻）
  clientMessageSentTimestamp: z.number(), // Webアプリがメッセージを送信した時刻（デバイスでの処理が完了した時刻＆上り通信を開始した時刻）
  serverMessageReceivedTimestamp: z.number(), // WebSocketサーバがメッセージを受信した時刻（上り通信が完了した時刻＆サーバでの処理を開始した時刻）
  serverResponseSentTimestamp: z.number(), // WebSocketサーバがレスポンスを送信した時刻（サーバでの処理が終了した時刻＆下り通信を開始した時刻）
});

// 2. タイプの宣言 (スキーマから自動推論)
// ZodスキーマからTypeScriptの型を生成します。
// これにより、スキーマと型定義が常に一致することが保証されます。
export type WsResponse = z.infer<typeof WsResponseSchema>;

// 3. パース関数の実装
// 不明なデータを受け取り、WsResponseで検証・型付けします。
// 検証に失敗した場合は、Zodが詳細なエラーをスローします。
export function parseAsWsResponse(data: unknown): WsResponse {
  return WsResponseSchema.parse(data);
}
