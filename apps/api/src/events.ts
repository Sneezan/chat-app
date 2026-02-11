import EventEmitter from "node:events";
import { on } from "node:events";

type MessagePayload = {
  id: number;
  content: string;
  createdAt: Date;
  sender: { id: number; username: string };
};

export const messageEmitter = new EventEmitter();
messageEmitter.setMaxListeners(100);

export function emitNewMessage(
  threadId: number,
  message: MessagePayload,
  participantUserIds: number[]
) {
  messageEmitter.emit("message", threadId, message);
  for (const userId of participantUserIds) {
    messageEmitter.emit("threadListUpdate", userId);
  }
}

export function toMessageIterable(
  signal?: AbortSignal | undefined
): AsyncIterable<[threadId: number, message: MessagePayload]> {
  return on(messageEmitter, "message", { signal }) as AsyncIterable<
    [threadId: number, message: MessagePayload]
  >;
}

export function toThreadListUpdateIterable(
  userId: number,
  signal?: AbortSignal | undefined
): AsyncIterable<void> {
  return (async function* () {
    for await (const [targetUserId] of on(
      messageEmitter,
      "threadListUpdate",
      { signal }
    ) as AsyncIterable<[number]>) {
      if (targetUserId === userId) yield;
    }
  })();
}
