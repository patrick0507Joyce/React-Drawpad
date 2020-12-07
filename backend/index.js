const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const PORT = process.env.PORT || 5000

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set used transport technologies here
io.set('transports', ['polling', 'websocket']);

io.on('connection', (socket) => {    
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({id: socket.id, name, room});

        if(error) return callback(error);

        socket.join(user.room);

        socket.emit('message', { user: 'admin', text: `${user.name}, Welcome to our room ${user.room}`});
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined`});
        

        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room) });
        //no error's callback
        callback();
    });

    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', { user: user.name, text: msg });
        callback();
    });

    socket.on('disconnect', () => {
        console.log('we have lost conenction!!');
        const user = removeUser(socket.id);
        
        if(user) {
            io.to(user.room).emit('message', {user:'admin', text:`${user.name} has left room!`});
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
    })
    
    socket.on('canvas_mouse_co-ordinates', (coordinates) => {
        const user = getUser(socket.id);
        socket.broadcast.to(user.room).emit('incoming-canvas-coordinates', coordinates);

    })
    
    socket.on('canvas_clear', () => {
        const user = getUser(socket.id);
        socket.broadcast.to(user.room).emit('canvas_clear');
    })
})

app.use(router);

server.listen(PORT, () => console.log(`Server has already started on port ${PORT}`));
