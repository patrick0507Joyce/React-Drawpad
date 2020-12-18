import React from "react";

import "./UserCount.css";
import onlineIcon from "../../Icons/onlineIcon.png";

const UserCount = ({ users }) => {
  return users ? (
      <div className="userCount">
        <div className="topInnerContainer">
          <img className="onlineIcon" src={onlineIcon} alt="online" />
          <h3>Players in room: {users.length}</h3>
        </div>
        <div className="bottomInnerContainer">
          <b>Active Users:</b>
          <ul class="list-unstyled">
            {users.map((user, i) => (
              <li key={i}>{user.name}</li>
            ))}
          </ul>
        </div>
      </div>
  ) : null;
};

export default UserCount;
