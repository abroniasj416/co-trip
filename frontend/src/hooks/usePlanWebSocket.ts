import { useEffect, useRef, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL ?? 'ws://localhost:8080';

export type MessageType =
  | 'PLACE_ADDED'
  | 'PLACE_DELETED'
  | 'PLACE_STATUS_CHANGED'
  | 'MEMO_UPDATED'
  | 'PLACE_ORDER_CHANGED'
  | 'USER_JOINED'
  | 'USER_LEFT';

export interface CollaborationMessage {
  type: MessageType;
  planId: string;
  senderNickname: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

interface UsePlanWebSocketOptions {
  planId: string;
  token: string | null;
  onMessage: (msg: CollaborationMessage) => void;
}

export function usePlanWebSocket({ planId, token, onMessage }: UsePlanWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);

  const sendMessage = useCallback(
    (type: MessageType, payload: Record<string, unknown>) => {
      if (!clientRef.current?.connected) return;
      clientRef.current.publish({
        destination: `/app/plan/${planId}`,
        body: JSON.stringify({ type, payload }),
      });
    },
    [planId]
  );

  useEffect(() => {
    if (!token || !planId) return;

    const client = new Client({
      brokerURL: `${WS_BASE_URL}/ws`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(`/topic/plan/${planId}`, (frame: IMessage) => {
          try {
            onMessage(JSON.parse(frame.body) as CollaborationMessage);
          } catch (e) {
            console.error('WebSocket 메시지 파싱 실패', e);
          }
        });
      },
      onStompError: (frame) => console.error('STOMP 에러', frame),
    });

    client.activate();
    clientRef.current = client;
    return () => { client.deactivate(); };
  }, [planId, token, onMessage]);

  return { sendMessage };
}
