import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server } from 'http';
import { RedisStateManager } from '../redis/redisStateManagerForSocketV2';
import { logger } from '../../shared/logger';
//@ts-ignore
import colors from 'colors';
import getUserDetailsFromToken from '../getUesrDetailsFromToken';
import { User } from '../../modules/user/user.model';
import { TRole } from '../../middlewares/roles';

class SocketService {

  private static instance: SocketService;
  private io: SocketIOServer | null = null;
  private isInitialized = false;
  private isInitializing = false;
  private redisStateManager!: RedisStateManager;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public async initialize(
    server: http.Server, 
    redisPubClient: any, 
    redisSubClient: any,
    redisStateClient: any
  ): Promise<SocketIOServer> {
    
    // Prevent multiple initializations
    if (this.isInitialized) {
      logger.warn(`⚠️ Socket.IO already initialized in worker ${process.pid}`);
      return this.io!;
    }

    if (this.isInitializing) {
      logger.warn(`⚠️ Socket.IO initialization in progress in worker ${process.pid}`);
      throw new Error('Socket.IO initialization already in progress');
    }

    this.isInitializing = true;

    try {
      logger.info(colors.blue(`🔧 Initializing Socket.IO in worker ${process.pid}...`));

      // Create Socket.IO server
      this.io = new SocketIOServer(server, {
        // pingTimeout: 60000,
        // pingInterval: 25000,
        // upgradeTimeout: 30000,
        // maxHttpBufferSize: 1e6,
        cors: {
          origin: '*',
          // methods: ['GET', 'POST']
        },
        // allowEIO3: true, // Support older clients
        // transports: ['polling', 'websocket']
      });

      // Initialize Redis state manager
      this.redisStateManager = new RedisStateManager(redisStateClient);

      // Setup Redis adapter with error handling
      try {
        const adapter = createAdapter(redisPubClient, redisSubClient);
        this.io.adapter(adapter);
        logger.info(colors.green(`✅ Redis adapter attached to worker ${process.pid}`));
      } catch (adapterError) {
        logger.error('Failed to setup Redis adapter:', adapterError);
        throw adapterError;
      }

      // Setup middleware and event handlers
      await this.setupMiddleware();
      this.setupEventHandlers();
      
      // Add connection error handlers
      this.setupErrorHandlers();

      this.isInitialized = true;
      this.isInitializing = false;

      logger.info(colors.green(`🚀 Socket.IO successfully initialized in worker ${process.pid}`));
      
      return this.io;

    } catch (error) {
      this.isInitializing = false;
      logger.error(`💥 Failed to initialize Socket.IO in worker ${process.pid}:`, error);
      throw error;
    }
  }

  private setupErrorHandlers() {
    if (!this.io) return;

    this.io.engine.on('connection_error', (err) => {
      logger.error(`🔴 Socket.IO connection error in worker ${process.pid}:`, {
        message: err.message,
        description: err.description,
        context: err.context,
        type: err.type
      });
    });

    this.io.on('error', (error) => {
      logger.error(`🔴 Socket.IO server error in worker ${process.pid}:`, error);
    });

    // Handle adapter errors ❌ REMOVE THIS — IT'S INVALID
    // this.io.adapter.on('error', (error) => {
    //   logger.error(`🔴 Redis adapter error in worker ${process.pid}:`, error);
    // });
  }

  public getIO(): SocketIOServer {
    if (!this.isInitialized || !this.io) {
      throw new Error(`Socket.IO not initialized in worker ${process.pid}`);
    }
    return this.io;
  }

  

  private startCleanupJob() {
    // Clean up stale connections every 5 minutes
    setInterval(async () => {
      try {
        await this.redisStateManager.cleanupStaleConnections();
      } catch (error) {
        logger.error('Error in cleanup job:', error);
      }
    }, 5 * 60 * 1000);
  }

  private async setupMiddleware() {
    if (!this.io) return;
    
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || 
                     socket.handshake.headers.token as string;

                     

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const user = await this.getUserDetailsFromToken(token);

        // console.log("user", user)
        // 🔥 CRITICAL: Convert ObjectId to string

        if (!user) {
          return next(new Error('Invalid authentication token'));
        }

        const modifiedUser= {
          ...user,  // 🟡 issue  MUST BE RESOLVED
          _id: user._id.toString(), // 🔥 CRITICAL: Convert ObjectId to string
        };
        //💡 Rule: Always convert Mongoose ObjectId to .toString() before using in Redis, Socket.IO rooms, or logs. 
        socket.data.user = modifiedUser; // 🟡 issue  MUST BE RESOLVED
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    // console.log("111111111111111")
    if (!this.io) return;

    // console.log("111111111111111")

    /*********
     * 🟢🟢 
     * ***** */
    this.io.on('connection', async (socket: Socket) => {
      const user = socket.data.user; // 🟡 issue  MUST BE RESOLVED

      
      const userId = user._id;
      const workerId = process.pid.toString();

      logger.info(colors.blue(
        `🔌🟢 User connected: ${userId} on Worker ${workerId} Socket ${socket.id}`
      ));

      try {
        // Get user profile
        const userProfile = await this.getUserProfile(userId);

        console.log("userProfile in connection 🔌🔌", userProfile)
        socket.data.userProfile = userProfile;

        console.log("🔌2🔌")

        // Handle connection in Redis
        const oldSocketId = await this.redisStateManager.handleUserReconnection(
          userId, 
          socket.id, 
          workerId, 
          { name: user.name, profileImage: userProfile?.profileImage }
        );

        // Disconnect old socket if exists
        if (oldSocketId) {
          const oldSocket = this.io!.sockets.sockets.get(oldSocketId);
          if (oldSocket) {
            oldSocket.disconnect(true);
          }
        }

        // Join user to their personal room
        socket.join(userId);

        // 🆕 Join role-based rooms
        if (userProfile.role == TRole.admin) {

          console.log("🔌3🔌")
          socket.join(`role::${userProfile.role}`); // e.g., "role::admin", "role::user"
          logger.info(`👤🛡️ User ${userId} joined role room: role::${userProfile.role}`);
        }

        // Notify related users about online status
        await this.notifyRelatedUsersOnlineStatus(userId, userProfile, true);

        // Setup event handlers
        this.setupUserEventHandlers(socket, userId, userProfile);

        // Handle disconnection
        socket.on('disconnect', async () => {
          await this.handleUserDisconnection(socket, userId);
        });

      } catch (error) {
        logger.error('Error in socket connection:', error);
        socket.disconnect();
      }
    });
  }

  private setupUserEventHandlers(socket: Socket, userId: string, userProfile: any) {
    // Get related online users
    socket.on('only-related-online-users', async (data: {userId: string}, callback) => {
      try {
        const relatedOnlineUsers = await this.redisStateManager.getRelatedOnlineUsers(data.userId);
        
        logger.info(`📊 Related online users for ${data.userId}: ${relatedOnlineUsers.length}`);
        callback?.({ success: true, data: relatedOnlineUsers });
      } catch (error) {
        logger.error('Error getting related online users:', error);
        callback?.({ success: false, message: 'Failed to fetch related online users' });
      }
    });

    // Join conversation
    socket.on('join', async (conversationData: {conversationId: string}, callback) => {
      if (!conversationData.conversationId) {
        return this.emitError(socket, 'conversationId is required');
      }

      const conversationId = conversationData.conversationId;
      
      // Join socket.io room
      socket.join(conversationId);
      
      // Update Redis state
      await this.redisStateManager.joinRoom(userId, conversationId);
      
      // Get room users from Redis
      const roomUsers = await this.redisStateManager.getRoomUsers(conversationId);
      
      logger.info(`👥 Room ${conversationId} has ${roomUsers.length} users: ${roomUsers.join(', ')}`);

      // Notify others in the chat
      socket.to(conversationId).emit('user-joined-chat', {
        userId,
        userName: userProfile?.name,
        conversationId,
        isOnline: true
      });
    });

    // Leave conversation
    socket.on('leave', async (conversationData: {conversationId: string}, callback) => {
      if (!conversationData.conversationId) {
        return callback?.({ success: false, message: 'conversationId is required' });
      }

      const conversationId = conversationData.conversationId;
      
      // Leave socket.io room
      socket.leave(conversationId);
      
      // Update Redis state
      await this.redisStateManager.leaveRoom(userId, conversationId);
      
      socket.to(conversationId).emit('user-left-conversation', {
        userId,
        userName: userProfile?.name,
        conversationId,
        message: `${userProfile?.name} left the conversation`
      });

      callback?.({ success: true, message: 'Left conversation successfully' });
    });

    // Add other event handlers here (send-new-message, get-all-conversations, etc.)
    // ... (your existing event handlers remain the same)
  }

  private async handleUserDisconnection(socket: Socket, userId: string) {
    logger.info(colors.red(`🔌🔴 User disconnected: ${userId} Socket ${socket.id}`));
    
    try {
      // Remove from Redis state
      await this.redisStateManager.removeOnlineUser(userId, socket.id);
      
      // Notify related users about offline status
      await this.notifyRelatedUsersOnlineStatus(userId, null, false);
      
    } catch (error) {
      logger.error('Error handling user disconnection:', error);
    }
  }

  private async notifyRelatedUsersOnlineStatus(userId: string, userProfile: any, isOnline: boolean) {
    try {
      const relatedUsers = await this.redisStateManager.getRelatedOnlineUsers(userId);
      
      relatedUsers.forEach((relatedUserId: string) => {
        this.io!.emit(`related-user-online-status::${relatedUserId}`, {
          userId,
          isOnline,
          userName: userProfile?.name || '',
        });
      });

    } catch (error) {
      logger.error('Error notifying related users:', error);
    }
  }

  // =============================================
  // Public API Methods
  // =============================================
  
  /*******
   * 🟢🟢 
   * This method helps us to send notification to any user based on his/her userId
   * we call this method into bullmq.ts -> startNotificationWorker
   * 
   * ********* */
  public async emitToUser(userId: string, event: string, data: any): Promise<boolean> {
    if (!this.io) return false;
    
    const isOnline = await this.redisStateManager.isUserOnline(userId);
    if (isOnline) {
      this.io.to(userId).emit(event, data);
      return true;
    }
    return false;
  }

  /********
   * 🟢🟢 
   * This method helps us to send notification to admin
   * 
   * ******* */
// Add new method for role-based emission
  public emitToRole(role: string, event: string, data: any): boolean {
    if (!this.io) return false;
    this.io.to(`role::${role}`).emit(event, data);
    logger.info(`📢 Emitted to role: ${role}`);
    return true
  }

  public async emitToConversation(conversationId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(conversationId).emit(event, data);
  }

  public emit(event: string, data: any) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  public async getOnlineUsers(): Promise<string[]> {
    return await this.redisStateManager.getAllOnlineUsers();
  }

  public async isUserOnline(userId: string): Promise<boolean> {
    return await this.redisStateManager.isUserOnline(userId);
  }

  public async getUserConnectionInfo(userId: string) {
    return await this.redisStateManager.getUserConnectionInfo(userId);
  }

  public async getSystemStats() {
    return await this.redisStateManager.getSystemStats();
  }

  // 🟢🟢 Helper methods (same as before)
  private async getUserDetailsFromToken(token: string) {
    return await getUserDetailsFromToken(token);
  }

  // 🟢🟢
  private async getUserProfile(userId: string) {
    return await User.findById(userId, 'id name profileImage role');
  }

  private emitError(socket: Socket, message: string, disconnect = false) {
    socket.emit('error', { message });
    if (disconnect) socket.disconnect();
  }

  public close(): void {
    if (this.io) {
      logger.info(colors.yellow(`🔌 Closing Socket.IO in worker ${process.pid}...`));
      
      // Close all connections gracefully
      this.io.sockets.disconnectSockets(true);
      
      // Close the server
      this.io.close();
      
      this.io = null;
      this.isInitialized = false;
      
      logger.info(colors.green(`✅ Socket.IO closed in worker ${process.pid}`));
    }
  }
}

export const socketService = SocketService.getInstance();