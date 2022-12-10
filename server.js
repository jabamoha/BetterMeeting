//BackEnd
const express = require('express');
//express server to read,check,manipulate data from incoming requests
//return response ...
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);//make the server use socket io
const { v4: uuidV4 } = require('uuid');//make dynamic and unique urls for each room

//server is only to setup the rooms not to direct users communication , users communicate directly with each other

app.set('view engine', 'ejs');//how to render our "views" file
app.use(express.static('public'));//what is the front end file

app.get('/', (req,res)=>{//on root url redirect to unique url
    res.redirect(`/${ uuidV4() }`);
});

app.get('/:room',(req,res)=>{
    res.render('room',{roomId: req.params.room});
});

io.on('connection', socket => { // whenever someone connects to webpage
      socket.on('join-room', (roomId, userId) => {//whenever someone joins a specific room
      socket.join(roomId);
      socket.broadcast.to(roomId).emit('user-connected', userId);

      socket.on('message', (message,username) => {
        io.to(roomId).emit('createMessage', message,username);
      }); 
  
      socket.on('disconnect', () => {
        socket.broadcast.to(roomId).emit('user-disconnected', userId);
      });
      
    });
  });

server.listen(3000);//start server on port 3000