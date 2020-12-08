import React from 'react';

import './UserCount.css'
import onlineIcon from '../../Icons/onlineIcon.png'

const UserCount = ({ users }) => {
    return (users) ?
    (<div className="userCount">
        <div className="leftInnerContainer">
            <img className="onlineIcon" src={onlineIcon} alt="online" />
            <h3>Online User Count in this room: {users.length}</h3>
        </div>
        <div className="leftInnerContainer">
            <ol>
                {
                    users.map((user, i) => <li key={i}>{user.name}</li>)
                }
            </ol>
        </div>
</div>)
    : null
}

export default UserCount;

