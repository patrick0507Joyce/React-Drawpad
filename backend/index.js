const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const PORT = process.env.PORT || 5000

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {    
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({id: socket.id, name, room});

        if(error) return callback(error);
        
        socket.emit('message', { user: 'admin', text: `${user.name}, Welcome to our room ${user.room}`});
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined`});
        socket.join(user.room);

        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
        //no error's callback
        callback();
    });

    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', { user: user.name, text: msg});
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
        callback();
    });


    socket.on('disconnect', () => {
        console.log('we have lost conenction!!');
        const user = removeUser(socket.id);
        
        if(user) {
            io.to(user.room).emit('message', {user:'admin', text:`${user.name} has left room!`})
        }
    })
})





app.use(router);

server.listen(PORT, () => console.log(`Server has already started on port ${PORT}`));
