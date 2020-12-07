import React, {useState, useEffect} from 'react'
import queryString from 'query-string'

import './Chat.css';

import InfoBar from '../InfoBar/InfoBar'
import Input from '../Input/Input'
import Messages from '../Messages/Messages'
import UserCount from '../UserCount/UserCount'
import Canvas from '../Canvas/Canvas'
import socket from '../socket'

const Chat = ({location}) => {

    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState([]);
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);

    

    useEffect(() => {
        const {name, room} = queryString.parse(location.search);
        
        // Set available transport technologies before using socket

        setName(name);
        setRoom(room);
        
        socket.emit('join', { name, room }, () => {

        });

        return () => {
            socket.emit('disconnect');
            socket.off();
        }
    }, [location.search]);

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages(messages => [...messages, message ]);
        });
        socket.on('roomData', ({users}) => {
            setUsers(users);
        });
    }, []);

    const SendMessage = (event) => {
        event.preventDefault();

        if(message) {
            socket.emit('sendMessage', message, () => setMessage(''));
        }
    }

    console.log("message info:", messages);
    console.log("Users info:", users);

    return(
        <div className="outerContainer">
        <Canvas></Canvas>
            <div className="container">
                <InfoBar room={ room }/>
                <Messages messages={ messages } name={ name }/>
                <Input message={ message } setMessage={setMessage} sendMessage={SendMessage} />
                <UserCount users={ users } />
            </div>
        </div>
    )
}

export default Chat;