const path          = require('path');
const http          = require('http');
const express       = require('express');
const moment        = require('moment');
const formatMessage = require('./utils/messages');
const mongoose      = require('mongoose');
const Msg           = require('./utils/messageModel');
const { Server }    = require('socket.io');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server);

const botName = '';
const mongoDB = 'placeholder'; 

app.use(express.static(path.join(__dirname, 'public')));

// Connect to mongoDB
mongoose.connect(mongoDB, { useNewUrlParser: true,
                            useUnifiedTopology: true }).then(() => {
  console.log("connected to mongodb");
}).catch(err => console.log(err));

// Client coonects with socket
io.on('connection', (socket) => {
  console.log("connection"); 
 
  /*
  Msg.find().then(result => {
    console.log(result);
    socket.emit('output-messages', result);
  });
  */
 
  var username;
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room); 
    
    Msg.find({room : room}).then(result => {
      console.log(result);
      socket.emit('output-messages', result);
    });
    
    socket.join(user.room);

    // Welcome current user
    //socket.emit('message', formatMessage(botName, 'Welcome to pubChat!', moment().format('h:mm a')));

    // Broadcast when a user connects
    socket.broadcast.to(user.room).emit(
      'message', formatMessage(botName, `${user.username} has joined the chat`, moment().format('h:mm a'))
    );

    // Send users and room 
    io.to(user.room).emit('roomUsers', {
      room  : user.room,
      users : getRoomUsers(user.room)
    });

    // Listen for chat message
    // write message to DB
    socket.on('chatMessage', msg => {
      const user = getCurrentUser(socket.id);
      
      const message = new Msg({
        text : msg, 
        username : user.username, 
        room : user.room,
        time : moment().format('h:mm a')
      });

      message.save().then(() => { 
        io.to(user.room).emit('message', formatMessage(user.username + ' ', msg, message.time))
      });

    });

    // Client disconnects
    socket.on('disconnect', () => {
      const user = userLeave(socket.id);
      if (user) {
        io.to(user.room).emit(
          'message',
          formatMessage(botName, `${user.username} has left the chat `, moment().format('h:mm a'))
        );

        // update users and room info
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
        });
      }
    });
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});


