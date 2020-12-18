const rooms = [];

const addRoom = ({ id, msg }) => {

    const existingRoom = rooms.find((room) => room.id == id);
    if (existingRoom) {
        console.log("Room has msg set before, removing")
        removeRoomById(id)
    } else {
        console.log("Room msg not set")
    }
    
    const room = {id, msg};

    rooms.push(room);
    console.log(room);
    return {room};
}

const removeRoomById = (id) => {
    const index = rooms.findIndex((rooms) => rooms.id === id);
    if ( index != -1) {
        return rooms.splice(index, 1)[0];
    }
}

const getRoom = (id) => {
    return rooms.find(rooms => rooms.id == id)
};

module.exports = { addRoom, getRoom};