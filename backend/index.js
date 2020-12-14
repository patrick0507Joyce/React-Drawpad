const express = require("express");
const socketio = require("socket.io");
const http = require("http");

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

const PORT = process.env.PORT || 5000;

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
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    //no error's callback
    callback();
  });

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
          pickNextPlayer(user);
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
    socket.emit("start_new_game");
    console.log("Sent new game emit");
  });

  socket.on("gameStart", () => {
    console.log("GAME START CALLED");
    console.log(socket.id);
    const user = getUser(socket.id);
    console.log(user);
    const usersInRoom = getUsersInRoom(user.room);
    console.log("Users in room: ", usersInRoom);
    for (let i = 0; i < usersInRoom.length; i++) {
      var userID = usersInRoom[i].id;
      // console.log("User ID:")
      // console.log(userID)
      if (userID != user.id) {
        io.to(userID).emit("blockDrawing");
        setUserIsDrawing(userID, false);
      } else {
        io.to(userID).emit("enableDrawing");
        setUserIsDrawing(userID, true);
      }
      setUserHasGuessed(userID, false);
    }
    io.in(user.room).emit("message", {
      user: "admin",
      text: `${user.name} is now drawing!`,
    });

    // broadcast.to(user.room).emit('gameStart', {  });
  });

  socket.on("canvas_mouse_co-ordinates", (coordinates) => {
    const user = getUser(socket.id);
    socket.broadcast
      .to(user.room)
      .emit("incoming-canvas-coordinates", coordinates);
  });

  socket.on("canvas_clear", () => {
    const user = getUser(socket.id);
    socket.broadcast.to(user.room).emit("canvas_clear");
  });

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
  console.log("User length is: ", users.length);
  if (counter == users.length - 1) {
    console.log("Everyone has guessed!");
    return true;
  } else {
    return false;
  }
}

function pickNextPlayer(user) {
  var new_user = pickUserWhoHasntGone(user.room);
  if (new_user) {
    io.to(new_user.id).emit("make_user_pick_new_room_msg");
  } else {
    console.log("All users have gone, clear them");
    clearHadTurnForUsersInRoom(user.room);
    pickNextPlayer(user);
  }
}

app.use(router);

server.listen(PORT, () =>
  console.log(`Server has already started on port ${PORT}`)
);
