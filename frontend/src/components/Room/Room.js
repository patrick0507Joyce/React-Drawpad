import React, { useState, useEffect } from 'react'
import queryString from 'query-string'

import Chat from '../Chat/Chat';
import UserCount from '../UserCount/UserCount';
import Canvas from '../Canvas/Canvas'

import socket from '../socket'

const Room = ({ location }) => {

    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [users, setUsers] = useState([]);


    useEffect(() => {
        const { name, room } = queryString.parse(location.search);

        setName(name);
        setRoom(room);

        socket.emit('join', { name, room }, () => {
        });

        socket.on('roomData', ({ users }) => {
            setUsers(users);
        });

        return () => {
            socket.emit('disconnect');
            socket.off();
        }
    }, [location.search]);

    return (
        <div className="outerContainer">
            <UserCount users={users}></UserCount>
            <Canvas></Canvas>
            <Chat room={room} name={name}></Chat>
        </div>
    )
}

export default Room;