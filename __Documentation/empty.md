// Notify each participant (except the sender if excludeUserId is provided)
        conversationParticipants.forEach(async(participant: any) => {
          const participantId = participant.userId?.toString();
          
          console.log(`1️⃣ .forEach Participant ID: ${participantId}, User ID: ${userId}`);

          const isOnline = await socketService.isUserOnline(participantId);
         
          // Check if participant is online
          //if (Array.from(onlineUsers).some(id => id.toString() === participantId)) {

          if(isOnline){
            console.log(`${participantId} 🟢online.. `)
            

          if(participantId !== userId.toString()){  // 🧪🧪🧪🧪🧪🧪🧪
            // which means userId is receiverId

            const userPro = await this.getUserProfile(userId) as IUserProfile;

            await socketService.emitToUser(
                participantId,
                `conversation-list-updated::${participantId}`,
                {
                  userId: {
                    "_userId": userId,
                    "name": userPro.name,
                    "profileImage": userPro.profileImage,
                    "role": userPro.role,
                  },
                  conversations:[
                    {
                      _conversationId: updatedConversation?._id,
                      lastMessage : messageData.text,
                      updatedAt : newMessage.createdAt
                    },
                  ],
                }
            );
          }

            
            
          }else{
            console.log(`${participantId}offline ⭕`)
            // TODO : MUST Firebase Push notification
             
          }
        }