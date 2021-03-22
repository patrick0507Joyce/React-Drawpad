import React, {useState, useEffect} from 'react'
import './Chat.css';

import InfoBar from '../InfoBar/InfoBar'
import Input from '../Input/Input'
import Messages from '../Messages/Messages'
import socket from '../socket'
import { encrypt, decrypt } from '../Crypto/Crypto'

const Chat = ({room, name}) => {

    const [message, setMessage] = useState([]);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.on('message', (message) => {
            if (typeof(message.text) == 'string') {
                console.log({message});
                setMessages(messages => [...messages, message]);
            } else {
                let decryptedMessage = {
                    user: message.user,
                    text: decrypt(message.text)
                }
                console.log({decryptedMessage});
                setMessages(messages => [...messages, decryptedMessage]);
            }
        });
    }, []);

    const SendMessage = (event) => {
        event.preventDefault();
        
        if(message) {
            let encrpytedMessage = encrypt(message);
            console.log("sending:", encrpytedMessage);
            socket.emit('sendMessage', encrpytedMessage, () => setMessage([]));
        }
    }

    console.log("messages info:", messages);
    console.log("Room:", room);
    console.log("Name:", name);

    return(
        <div className="outerContainer">
            <div className="containerChat">
                <InfoBar room={ room }/>
                <Messages messages={ messages } name={ name }/>
                <Input message={ message } setMessage={setMessage} sendMessage={SendMessage} />
            </div>
        </div>
    )
}

export default Chat;