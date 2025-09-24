import { useRef, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket'; // 内部で利用するカスタムフック
import { Config } from '../config';
import { type WsMessage, type WsResponse, parseAsWsResponse } from '../api/types';
import { convertWsMessageToBuffer } from '../utils/convertWsMessageToBuffer';

type UseWsResponseProps = {
  callbackOnWsResponse: (wsResponse: WsResponse, clientResponseReceivedTimestamp: number) => void;
};

export const useWsResponse = ({ callbackOnWsResponse }: UseWsResponseProps) => {
  // 1. 親コンポーネントから渡されるコールバック関数の最新版を保持するためのref
  // これにより、コールバック関数が再生成されても、このフック内のuseEffectは再実行されない
  const callbackRef = useRef(callbackOnWsResponse);
  useEffect(() => {
    callbackRef.current = callbackOnWsResponse;
  }, [callbackOnWsResponse]);

  // 2. WebSocketからメッセージ受信時に実行する安定した（メモ化された）関数
  // この関数の参照は決して変わらないため、useWebSocketフックは再実行されない
  const stableOnResponse = useCallback(
    (wsResponse: WsResponse, clientResponseReceivedTimestamp: number) => {
      // メッセージが届いたら、refを通じて最新のコールバック関数を呼び出す
      callbackRef.current(wsResponse, clientResponseReceivedTimestamp);
    },
    []
  ); // 依存配列が空なので、この関数は一度しか生成されない

  // 3. 内部でWebSocketの接続を管理するカスタムフックを呼び出す
  const { isConnected, sendMessage } = useWebSocket<WsResponse>({
    url: Config.WEBSOCKET_URL,
    callbackOnResponse: stableOnResponse, // 常に同じ参照の関数を渡す
    parseResponse: parseAsWsResponse,
  });

  // 4. 親コンポーネントに渡すためのメッセージ送信関数もuseCallbackでメモ化する
  const sendWsMessage = useCallback(
    (wsMessage: WsMessage) => {
      if (isConnected) {
        const message = convertWsMessageToBuffer(wsMessage);
        sendMessage(message); // sendMessageも安定していることを期待
      } else {
        console.error('WebSocket is not connected.');
      }
    },
    [isConnected, sendMessage] // isConnectedかsendMessageが変更された場合のみ再生成
  );

  // 親コンポーネントはcallback経由でレスポンスを受け取るため、このフック内でのstateは不要
  return { sendWsMessage };
};
