import React, {useState, useEffect} from 'react'

import './Chat.css';

import InfoBar from '../InfoBar/InfoBar'
import Input from '../Input/Input'
import Messages from '../Messages/Messages'
import socket from '../socket'

const Chat = ({room, name}) => {

    const [message, setMessage] = useState([]);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages(messages => [...messages, message ]);
        });
    }, []);

    const SendMessage = (event) => {
        event.preventDefault();

        if(message) {
            socket.emit('sendMessage', message, () => setMessage([]));
        }
    }

    console.log("message info:", messages);
    console.log("Room:", room);
    console.log("Name:", name);

    return(
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={ room }/>
                <Messages messages={ messages } name={ name }/>
                <Input message={ message } setMessage={setMessage} sendMessage={SendMessage} />
            </div>
        </div>
    )
}

export default Chat;