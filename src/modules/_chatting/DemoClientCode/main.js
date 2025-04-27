const socket  = io();
// For Basic Reference.. sayed vai project  property rental .. 

// message from server ..   
socket.on('message', message  => {
   console.log(message);
})

// message submit 
chatForm.addEventListener('submit', e => {
   e.preventDefault();
   const message = e.target.elements.message.value;

   // emit message to server .. 
   socket.emit('chatMessage', message);
  }
)

// join chat room

socket.emit('joinRoom', ( conversationId ) => {
  console.log(`User joined in conversation : ${conversationId}`);
  socket.join(conversationId);
})


 
