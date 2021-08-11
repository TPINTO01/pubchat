const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

/*
 * MongoDB
const mongoose = require('mongoose');
const Msg = require('./models/messages');
const mongoDB = 'mongodb+srv://<insert username and passwkrd>@cluster0.3xcg6.mongodb.net/<database name here>?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true,
                            useUnifiedTopology: true }).then(() => {
  console.log("connected to mongodb");
}).catch(err => console.log(err));
*/

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/chat.html', (req, res) => {
  res.sendFile(__dirname + '/views/chat.html');
});


io.on('connection', (socket) => {
  console.log("connection"); 
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
