import { updateConversationsLastMessageQueue } from "../helpers/bullmq/bullmq";

//---------------------------------
//  global method to update conversation's last message when a person send new message through bull queue
//---------------------------------
export async function enqueueLastMessageToUpdateConversation(
  conversationId: string,
  lastMessageId: string,
  lastMessage: string,
) {

  const conversationUpdated = await updateConversationsLastMessageQueue.add(
    'updateConversationsLastMessageQueue-suplify',
    {
      conversationId,
      lastMessageId,
      lastMessage
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000, // 2s, 4s, 8s
      },
      removeOnComplete: true,
      removeOnFail: 1000, // keep failed jobs for debugging
    }
  );

  console.log("🔔 enqueueLastMessageToUpdateConversation hit :: conversationUpdated -> ")
}