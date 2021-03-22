const express = require("express");
const socketio = require("socket.io");
const http = require("http");

// Load env variables from .env and monitoring agents
require('dotenv').config()
const spmAgent = require('spm-agent-nodejs')

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  userHadTurn,
  setUserHasGuessed,
  setUserIsDrawing,
  pickUserWhoHasntGone,
  clearHadTurnForUsersInRoom,
} = require("./users");
const { addRoom, getRoom } = require("./room");
const { updateNotes, getNotes } = require("./notes");

const PORT = process.env.PORT || 9999;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set used transport technologies here
io.set("transports", ["polling", "websocket"]);

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      name,
      room,
      hadTurn: false,
      hasGuessed: false,
      isDrawing: false,
    });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, Welcome to our room ${user.room}`,
    });

    socket.broadcast
      //.to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    io.to(user.id).emit("notesData", {
      notes: getNotes()
    });
    
    //no error's callback
    callback();
  });

  socket.on("testPerformance", (msg) =>{
    console.log("received test message:", msg);
  })

  socket.on("sendMessage", (msg, callback) => {
    const user = getUser(socket.id);
    const room = getRoom(user.room);

    if (room) {
      if (room.msg == msg && user.isDrawing == false) {
        io.to(user.room).emit("message", {
          user: "admin",
          text: `${user.name} has guessed the word!`,
        });
        setUserHasGuessed(user.id, true);
        if (checkIfEveryoneHasGuessed(user.room)) {
          io.in(user.room).emit("message", {
            user: "admin",
            text: `Everyone guessed the word!`,
          });
          io.in(user.room).emit("canvas_clear");
          pickNextPlayer(user, socket);
        }
        callback();
      } else {
        io.to(user.room).emit("message", { user: user.name, text: msg });
        callback();
      }
    } else {
      console.log("infor", { user: user.name, text: msg });
      io.to(user.room).emit("message", { user: user.name, text: msg });
      callback();
    }
  });

  socket.on("setRoomDrawMessage", (msg) => {
    const user = getUser(socket.id);
    addRoom({ id: user.room, msg });
    console.log("Room msg set to: ", msg);
    console.log(user.id);
    startGame(socket)
  });

  socket.on("gameStart", () => {
    console.log("GAME START CALLED");
    console.log(socket.id);
    startGame(socket)
    // broadcast.to(user.room).emit('gameStart', {  });
  });

  socket.on("canvas_mouse_co-ordinates", (coordinates) => {
    const user = getUser(socket.id);
    // console.log("Sending mouse coordinates from user: ", user.id)
    if (user) {
      socket.broadcast
        //.to(user.room)
        .emit("incoming-canvas-coordinates", coordinates);
    }
  });

  socket.on("canvas_clear", () => {
    const user = getUser(socket.id);
    socket
    .to(user.room)
    .emit("canvas_clear");
  });


  socket.on('sync_notes', (notes, callback) => {
    console.log("recevied notes length",notes.length);
    updateNotes(notes);
    const latestNotes = getNotes();
    console.log("recevied notes length",latestNotes);
    const user = getUser(socket.id);
    //console.log("user room info", user);
    callback({status: "ok"});
    //TODO: fix the user.room undefined problem
    socket
    //.to(user.room)
    .broadcast
    .emit("incoming-notes", latestNotes);
  })

  socket.on("disconnect", () => {
    console.log("we have lost conenction!!");
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left room!`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

function checkIfEveryoneHasGuessed(room) {
  var users = getUsersInRoom(room);
  var counter = 0;
  for (let i = 0; i < users.length; i++) {
    if (users[i].hasGuessed) {
      counter++;
    }
    if (users[i].isDrawing) {
      userHadTurn(users[i].id);
    }
  }
  // console.log("User length is: ", users.length);
  if (counter == users.length - 1) {
    // console.log("Everyone has guessed!");
    return true;
  } else {
    return false;
  }
}

function startGame(socket) {
  const user = getUser(socket.id);
  // console.log(user);
  io.in(user.room).emit("canvas_clear");
  const usersInRoom = getUsersInRoom(user.room);
  // console.log("Users in room: ", usersInRoom);
  for (let i = 0; i < usersInRoom.length; i++) {
    var userID = usersInRoom[i].id;
    // console.log("User ID:")
    // console.log(userID)
    if (userID != user.id) {
      io.to(userID).emit("blockDrawing");
      console.log("Blocking drawing for user: ", userID)
      setUserIsDrawing(userID, false);
    } else {
      console.log("Enabling drawing for user: ", userID)
      io.to(userID).emit("enableDrawing");
      setUserIsDrawing(userID, true);
    }
    setUserHasGuessed(userID, false);
  }
  io.in(user.room).emit("message", {
    user: "admin",
    text: `${user.name} is now drawing!`,
  });
}

function pickNextPlayer(user, socket) {
  var new_user = pickUserWhoHasntGone(user.room);
  if (new_user) {
    console.log("Making user pick new room msg")
    console.log("Picked: ", new_user)
    var id = new_user.id;
    console.log(id)
    io.to(id).emit("make_user_pick_new_room_msg");
  } else {
    console.log("All users have gone, clear them");
    clearHadTurnForUsersInRoom(user.room);
    pickNextPlayer(user, socket);
  }
}

app.use(router);

server.listen(PORT, () =>
  console.log(`Server has already started on port ${PORT}`)
);
