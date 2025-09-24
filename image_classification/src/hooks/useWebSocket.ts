import { useCallback, useEffect, useRef, useState } from 'react';
import { Config } from '../config';

// 指数バックオフのロジックをシンプルに実装
const createBackoff = () => {
  let attempts = 0;
  return {
    getDelay: () => {
      if (attempts >= Config.MAX_RECONNECT_ATTEMPTS) return null;
      const delay = Config.RECONNECT_DELAY_MS * Math.pow(2, attempts);
      attempts++;
      return delay;
    },
    reset: () => {
      attempts = 0;
    },
  };
};

// --- Hookの定義 ---

type Props<Response> = {
  url: string;
  callbackOnResponse: (data: Response, clientResponseReceivedTimestamp: number) => void;
  // 汎用性を保つため、レスポンスのパース方法はコンポーネント側から受け取る
  parseResponse: (data: unknown) => Response;
};

type UseWebSocketReturn = {
  isConnected: boolean;
  sendMessage: (data: unknown) => void;
};

export const useWebSocket = <Response>(props: Props<Response>): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  // 再接続ロジック関連のRef
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef(createBackoff());

  // アンマウント時に意図せず再接続が走るのを防ぐためのRef
  const isUnmountedRef = useRef(false);

  // propsの関数は再生成される可能性があるため、Refに保持して安定させる
  const stableProps = useRef(props);
  useEffect(() => {
    stableProps.current = props;
  }, [props]);

  const connect = useCallback(() => {
    const { url, parseResponse, callbackOnResponse } = stableProps.current;

    // 接続済み、またはアンマウント済みの場合は何もしない
    if (socketRef.current?.readyState === WebSocket.OPEN || isUnmountedRef.current) {
      return;
    }

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connection established.');
      setIsConnected(true);
      backoffRef.current.reset(); // 再接続カウンターをリセット
    };

    // リモートサーバからメッセージ（Response）が返ってきた時に発生するイベント
    socket.onmessage = (event) => {
      try {
        const clientResponseReceivedTimestamp = performance.now(); // レスポンス受信直後の時刻
        const parsedJson = JSON.parse(event.data);
        const parsedData = parseResponse(parsedJson.data);
        callbackOnResponse(parsedData, clientResponseReceivedTimestamp);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    socket.onclose = (event) => {
      setIsConnected(false);
      console.log('WebSocket connection closed:', event.code, event.reason);

      // 正常なクローズ(1000)またはアンマウント時は再接続しない
      if (event.code === 1000 || isUnmountedRef.current) {
        return;
      }

      // 異常終了時は指数バックオフで再接続を試みる
      const delay = backoffRef.current.getDelay();
      if (delay !== null) {
        console.log(`Attempting to reconnect in ${delay}ms...`);
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      } else {
        console.error('WebSocket reconnect failed after several attempts.');
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, []);

  // マウント時に接続を開始し、アンマウント時にクリーンアップ
  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    return () => {
      isUnmountedRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      // 正常なクローズとして接続を閉じる
      socketRef.current?.close(1000, 'Component unmounted');
    };
  }, [connect]);

  const sendMessage = useCallback((data: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
        socketRef.current.send(data); // バイナリのまま送信
      } else {
        socketRef.current.send(JSON.stringify(data)); // オブジェクトならJSON化
      }
    } else {
      console.error('WebSocket is not connected. Cannot send message.');
    }
  }, []);

  return { isConnected, sendMessage };
};
