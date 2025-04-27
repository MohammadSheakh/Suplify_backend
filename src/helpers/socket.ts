import colors from 'colors';
import { Server, Socket } from 'socket.io';
import { logger } from '../shared/logger';

import { formatMessage } from '../utils/messages';

declare module 'socket.io' {
  interface Socket {
    userId?: string;
  }
}

const socket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    // we dont need this console anymore ..
    logger.info(
      colors.blue(`🔌🟢 1️⃣ A user connected .. socket id is : ${socket.id} `)
    );
    socket.on('user-connected 2️⃣', (userId: string) => {
      socket.userId = userId;
      socket.join(userId); // Join the room for the specific user
      logger.info(
        colors.green(`User ${userId} joined their notification room`)
      );
    });

    // Join a room for a specific conversation // Join Chat Room ..
    socket.on('join-room', conversationId => {
      console.log(`User 3️⃣ joined in Conversation : ${conversationId}`);
      socket.join(conversationId); // Join a room based on conversationId

      console.log('conversationId 🚧', conversationId);

      // welcome current user ..
      socket.emit(
        'message',
        formatMessage('System', 'welcome 4️⃣ to chatcord ')
      ); // single user

      // broadcast to all user when a user connects ..

      /*
       * socket.broadcast
       * .to(conversationId)
       * .emit('message', formatMessage('System', 'A user has joined the chat')); // single user
       *
       */

      /*** Conversation Id er upor base kore .. user er information niye ashte hobe .. */

      socket
        .to(conversationId)
        .emit(
          'message',
          formatMessage('System', 'A user 5️⃣ has joined the chat')
        );
    });

    // 🟢 ------ From front-end we emit chatMessage .. we have to catch that ..
    // Listen for chatMessage
    socket.on('send-message', data => {
      console.log(`New Data 9️⃣ received for send-message event : ${data}`);
      console.log('socket.id 🚧', socket.id);
      const eventName = `messages::${data.conversationId}`;
      console.log('eventName 🚧', eventName);
      io.to(data.conversationId).emit(eventName, data.message);
    });

    // welcome current user ..
    socket.emit('message', formatMessage('System', 'welcome 6️⃣ to chatcord ')); // single user

    // Broadcast when a user connects without the user who connecting ..
    /**
     *  socket.broadcast.emit('message' , formatMessage('System','A user has joined the chat'));
     *
     * // later we will have actual user names ..
     */

    socket.broadcast.emit(
      'message',
      formatMessage(
        'System',
        'A  7️⃣ user has joined the chat'
      ) /*socket.userId*/
    );
    // later we will have actual user names ..

    // to send message everybody // all the clients in general ..
    // io.emit()

    // Leave a room when a user disconnects or leaves
    socket.on('leave-room', conversationId => {
      console.log(`User left 1️⃣0️⃣ room: ${conversationId}`);
      socket.leave(conversationId);
    });

    // runs when a client disconnects ..
    socket.on('disconnect', () => {
      // to let everyone know ..
      io.emit(
        'message',
        formatMessage('System', 'A 1️⃣1️⃣ user has left the chat')
      );
      logger.info(colors.red(`🔌🔴 A user disconnected`));
    });
  });
};

export const socketHelper = { socket };
