# Real-Time Image Classification on the Web

## 概要

このプロジェクトは、Webカメラからの映像を利用して、リアルタイムに画像分類を行うWebアプリケーションです。

**TensorFlow.js** を用いて、機械学習モデルの一部をブラウザ（クライアントデバイス）で実行し、残りの重い処理をWebSocketサーバーにオフロードする**分割コンピューティング（Split Computing）** を実装しているのが最大の特徴です。これにより、クライアントデバイスの負荷を抑えながら、リアルタイムでの高度な推論処理を実現します。

## 主な機能

- **リアルタイム画像分類**: Webカメラの映像からリアルタイムにフレームをキャプチャし、その画像を分類し、その分類結果を表示します。
- **分割コンピューティング**:
  - 推論処理をクライアントとサーバーに分割し、中間特徴量をWebSocket経由で送受信します。
  - クライアント側の負荷を軽減し、非力なデバイスでもリアルタイム性を維持します。
- **モダンな技術スタック**: React, Vite, TypeScript, Tailwind CSS を採用し、高速で開発者体験の高いフロントエンドを構築しています。

## 動作の仕組み

1.  **カメラ映像の取得**: `useWebcam` フックを使用して、ユーザーのWebカメラにアクセスし、ビデオストリームを取得します。
2.  **クライアントサイドでの推論**:
    - 取得したビデオフレームからテンソルを作成し、TensorFlow.jsモデル（例: EfficientNet B0）の初期レイヤーを実行します。
    - `executeClassificationOnDevice` 関数により、`config.ts` で定義された `SPLIT_LAYER_NAME` までの処理が行われます。
3.  **サーバーへのオフロード**:
    - `useOffloadTask` フックを通じて、クライアントで計算された中間特徴量（テンソル）をWebSocketサーバーに送信します。
4.  **サーバーサイドでの推論と結果返却**:
    - サーバーは受け取った中間特徴量を基に、モデルの残りのレイヤーで推論を実行します。
    - 最終的な分類結果（上位5件など）をクライアントに返却します。
5.  **結果の描画**:
    - クライアントはサーバーから受け取った結果を `drawClassificationResult` 関数でCanvas上にリアルタイムに描画します。
    - この一連の流れを `requestAnimationFrame` または `setInterval` を用いたループ処理で繰り返すことで、リアルタイム性を実現しています。

## セットアップと実行方法

1.  **リポジトリをクローン:**
    ```bash
    git clone <repository-url>
    cd image_classification
    ```
2.  **依存関係をインストール:**
    ```bash
    npm install
    ```
3.  **開発サーバーを起動:**
    ```bash
    npm run dev
    ```
4.  ブラウザで `http://localhost:5173` （Viteのデフォルト）にアクセスします。

## 使用技術

- **フロントエンド**: React, Vite, TypeScript
- **機械学習**: TensorFlow.js, onnxruntime-web
- **スタイリング**: Tailwind CSS
- **型定義・バリデーション**: Zod

## firebase
firebaseにhostingする。
1. npm run build
2. firebase deploy --only hosting