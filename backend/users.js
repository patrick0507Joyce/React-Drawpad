const users = [];

const addUser = ({ id, name, room, hadTurn, hasGuessed, isDrawing}) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const existingUser = users.find((user) => user.room === room && user.name === name);
    if (existingUser) {
        return {error: "User name have been taken"};
    }

    const user = {id, name, room, hadTurn, hasGuessed, isDrawing};

    users.push(user);
    console.log(users)
    return {user};
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if ( index != -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find(user => user.id == id)
};

const setUserHasGuessed = (id, bool) => {
    const index = users.findIndex((user) => user.id === id);
    users[index].hasGuessed = bool;
    console.log(users[index])
};

const userHadTurn = (id) => {
    console.log(id)
    const index = users.findIndex((user) => user.id === id);
    console.log(index)
    users[index].hadTurn = true;
    console.log("User should have had turn", users)
};

const pickUserWhoHasntGone = (room) => {
    var user = users.find((user) => user.room == room && user.hadTurn == false);
    console.log("This player hasn't gone yet", user)
    return user
};

const clearHadTurnForUsersInRoom = (room) => {
    var smth = users.filter(user => user.room == room)
    smth.forEach(user => {
        removeUser(user.id)
        user.hadTurn = false;
        addUser(user)
    });

};

const setUserIsDrawing = (id, bool) => {
    const index = users.findIndex((user) => user.id === id);
    users[index ].isDrawing = bool;

};

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, setUserIsDrawing, getUsersInRoom, setUserHasGuessed, userHadTurn, pickUserWhoHasntGone, clearHadTurnForUsersInRoom };