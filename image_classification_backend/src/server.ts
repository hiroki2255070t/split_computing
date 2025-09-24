import * as http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { WsResponse } from "./adapters/types";
import { Config } from "./config";
import { convertBufferToWsMessage } from "./utils/convertBufferToWsMessage";
import { initializeBackend } from "./adapters/initializeBackend";

// 1. HTTPサーバーを先に作成する
// このサーバーがHTTPリクエスト（ヘルスチェック）とWebSocket接続の両方を処理します
const server = http.createServer((req, res) => {
  // ヘルスチェック用のエンドポイント
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ status: "ok", timestamp: new Date().toISOString() })
    );
  } else {
    // 他のHTTPリクエストは404を返す
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

// 2. WebSocketServerのオプション
const wssOptions = {
  server: server,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3, // 圧縮レベル (0-9)。3あたりが性能と圧縮率のバランスが良い
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    concurrencyLimit: 10, // Defaults to 10.
    threshold: 1024, // 1KB以上のメッセージのみ圧縮
  },
};
const wss = new WebSocketServer(wssOptions);

async function startServer() {
  try {
    const executor = await initializeBackend();

    // WebSocketの接続ハンドリング
    wss.on("connection", (ws: WebSocket) => {
      console.log("🚀 クライアントが接続しました。");

      ws.on("message", async (message: Buffer) => {
        try {
          const serverMessageReceivedTimestamp = performance.now();
          const wsMessage = convertBufferToWsMessage(message);
          const { top5, inferenceTimeOnRemote } =
            await executor.executeClassification(
              wsMessage.features,
              wsMessage.wsMessageMetadata.shape,
              wsMessage.wsMessageMetadata.splitLayerName
            );
          const serverResponseSentTimestamp = performance.now();
          const wsResponse: WsResponse = {
            top5: top5,
            splitLayerName: wsMessage.wsMessageMetadata.splitLayerName,
            inferenceTimeOnDevice:
              wsMessage.wsMessageMetadata.inferenceTimeOnDevice,
            inferenceTimeOnRemote,
            clientExecuteStartTimestamp:
              wsMessage.wsMessageMetadata.clientExecuteStartTimestamp,
            clientMessageSentTimestamp:
              wsMessage.wsMessageMetadata.clientMessageSentTimestamp,
            serverMessageReceivedTimestamp,
            serverResponseSentTimestamp,
          };
          ws.send(JSON.stringify({ type: "result", data: wsResponse }));
        } catch (error) {
          console.error("メッセージ処理中にエラーが発生しました:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An unknown error occurred";
          ws.send(JSON.stringify({ type: "error", message: errorMessage }));
        }
      });

      ws.on("close", () => {
        console.log("🔌 クライアントとの接続が切れました。");
      });

      ws.on("error", (error) => {
        console.error("WebSocketエラー:", error);
      });
    });

    // 3. 共有しているHTTPサーバーを起動
    // Dockerコンテナ内で外部からアクセスできるよう、'0.0.0.0'で待ち受ける
    server.listen(Config.PORT, Config.HOST, () => {
      console.log(
        `✅ [5/5] HTTPとWebSocketサーバがポート ${Config.PORT} で起動しました。`
      );
    });
  } catch (error) {
    console.error("💥💥💥 サーバー起動中に致命的なエラーが発生しました 💥💥💥");
    console.error(error);
    process.exit(1); // エラーが発生したらプロセスを終了
  }
}

// サーバーを起動
startServer();
