import React, { useState } from 'react'
import { Link, useHistory} from 'react-router-dom'

import './Join.css';

const Join = () => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const history = useHistory();


    function generateRandomRoomNo() {
        setRoom(Math.floor(100000 + Math.random() * 900000))
        history.push(`/room?room=${room}&name=${name}`)
    }

    function joinAlreadyCreatedRoom() {
        history.push(`/room?room=${room}&name=${name}`)
    }

    return (
        <div className="joinOuterContainer">
            <div className="joinInnerContainer"></div>
            <h1 className="heading">Join</h1>
            <div><input placeholder="Name" className="joinInput" type="text" onChange={(event) => setName(event.target.value)}></input></div>
            <div><input placeholder="Room" className="joinInput mt-20" type="text" onChange={(event) => setRoom(event.target.value)}></input></div>
            <button className="button mt-20" type="submit" onClick={joinAlreadyCreatedRoom} >Join existing room</button>
            <button className="button mt-20" type="submit" onClick={generateRandomRoomNo} >Create private room</button>
        </div>
    )
}

export default Join;