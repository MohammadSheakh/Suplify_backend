https://chat.qwen.ai/c/9eed467a-3712-4e86-ab42-750a1ec9646b
https://claude.ai/chat/f853ae16-bf82-4270-a3b2-14a5d98a693d
https://chatgpt.com/c/696230dd-c6c0-8322-89cb-5f6923ce200d

RedisStateManager track
1. who is online right now
2. which socket belong to which user
3. which rooms is a user in
4. if a user reconnects, what should we do?
5. if a server crashes, how do we clean junk data ?
==============================================================================
without redis .. 
user connects to server 1
user reconnects to server 2
-- server 1 still things user is online . which is a big issue 
===
with redis .. everyone sees the same truth

==============================================================================

Data structure used (Very Important)
SET  | Unique list           | Online users
HASH | key -> value          | user -> socket info
SET  | Many values           | Rooms

==============================================================================
socketForChatV3.ts -> setupEventHandlers -> handleUserReconnection -> addOnlineUser

```ts  handleUserReconnection

handleUserReconnection(userId, newSocketId, workerId, userInfo){
    
    const existingInfo = await this.getUserConnectionInfo(userId);

    // if new socket id and previous socketId does not match .. 
    // so reconnection happens .. 
    if (existingInfo && existingInfo.socketId !== newSocketId) {

        // clean up old socket mapping
        await this.redis.del(`chat:socket_user_map:${existingInfo.socketId}`)

        // Return old socket ID so caller can disconnect it
        return existingInfo.socketId;
    }

    // Add new connection
    await this.addOnlineUser(userId, newSocketId, workerId, userInfo);
    return null;
}
```

================================================================

```ts  getUserConnectionInfo

getUserConnectionInfo(userId){
    const info = await this.redis.hGetAll(`chat:user_socket_map:${userId}`)
    
    if(!info) return null;

    return {
        socketId : info.socketId,
        workerId : info.workerId,
        connectedAt : parseInt(info.connectedAt, 10),
        userInfo: info.userInfo ? JSON.parse(info.userInfo) : undefined,
    }
}

```
================================================================

```ts addOnlineUser

addOnlineUser(userId, socketId, workerId, userInfo){
    const pipeline = this.redis.multi();

    // Adds the user to the online users set.
    pipeline.sAdd("chat:online_users", userId);

    // Store user-socket mapping
    pipeline.hSet(
        `chat:socket_user_map:${userId}`,
        {
            socketId,
            workerId,
            connectedAt: Date.now().toString(),
            userInfo: JSON.stringify(userInfo || {}),
        }
    )

    // Store socket-user mapping
    pipeline.hSet(`${this.KEYS.SOCKET_USER_MAP}${socketId}`, { userId });

    // Set user status
    pipeline.hSet(
      `${this.KEYS.USER_STATUS}${userId}`,
      {
        isOnline: 'true',
        lastSeen: Date.now().toString(),
        workerId,
      }
    );

    await pipeline.exec();
}
```
================================================================

```ts  getAllOnlineUsers

getAllOnlineUsers(): Promise<string[]>{
    return await this.redis.sMembers('chat:online_users')
}
```
================================================================

```ts  isUserOnline

isUserOnline(userId: string): Promise<boolean> {
    const isMember = await this.redis.sIsMember('chat:online_users', userId);
    return isMember;
}
```
================================================================

```ts  removeOnlineUser

removeOnlineUser(userId: string, socketId: string) : Promise<void> {
    const pipeline = this.redis.multi();

    // remove from online users set
    pipeline.sRem('chat:online_users', userId);

    // remove from user-socket mapping
    pipeline.del(`chat:user_socket_map:${userid}`)

    // remove socket-user mapping
    pipeline.del(`chat:socket_user_map:${socketId}`)

    // update user status to offline
    pipeline.hSet(
        `chat:user_status:${userId}`,
        {
            isOnline : 'false',
            lastSeen: Date.now().toString()
        }
    )

    // remove user from all rooms
    await this.removeUserFromAllRooms(userId);

    await pipeline.exec();
}
```
================================================================

```ts  removeUserFromAllRooms

removeUserFromAllRooms(userId: string): Promise<void> {
    const userRooms = await this.getUserRooms(userId);

    if(userRooms.length === 0) return;

    const pipeline = this.redis.multi();

    // Remove user from all their rooms
    for(const roomId of userRooms){
        pipeline.sRem(`chat:room_users:${roomId}`, userId);
    }

    // clear user's rooms list 
    pipeline.del(`chat:user_rooms:${userId}`);

    await pipeline.exec();

    logger.info(`🧹 Removed user ${userId} from ${userRooms.length} rooms`);
}
```
================================================================

```ts  joinRoom

joinRoom(userId: string, roomId : string): Promise<void> {
    const pipeline = this.redis.multi();

    // Add room to user's rooms
    pipeline.sAdd(`chat:user_rooms:${userId}`, roomId);

    // Add user to room's users
    pipeline.sAdd(`chat:room_users:${roomId}`, userId);
    
    await pipeline.exec();

    logger.info(`👥 User ${userId} joined room ${roomId}`);
}
```
================================================================

```ts  leaveRoom

leaveRoom(userId: string, roomId : string): Promise<void> {
    const pipeline = this.redis.multi();

    // Remove room from user's rooms
    pipeline.sRem(`${this.KEYS.USER_ROOMS}${userId}`, roomId);

    // Remove user from room's users
    pipeline.sRem(`${this.KEYS.ROOM_USERS}${roomId}`, userId);

    await pipeline.exec();

    logger.info(`👥 User ${userId} left room ${roomId}`);
}
```
================================================================










