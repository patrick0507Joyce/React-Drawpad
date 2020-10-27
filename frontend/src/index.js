import React from 'react';
import ReactDOM from 'react-dom';
// FIXME: Use css for MainChart and UserList from old frontend
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

class Toggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(state => ({
      isToggleOn: !state.isToggleOn
    }));
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.isToggleOn ? 'ON' : 'OFF'}
      </button>
    );
  }
}

class MainChatPart extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div class="mainChatPart">
        <div class = 'person'><text id="onlineUserCount">Online User Number</text></div>
        <div class="container">
            <div id="content" class="content"></div>
        </div>
        <div class="footer">
          <select name="chatRoom" id="chatRoom">
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
          </select>
          <br></br>
          <input placeholder="set name" name="userName" id="userName"/>
          <button id="setNameBtn">SetName</button>
          <textarea placeholder="enter message" id="message" name="message"></textarea>
          <button id="sendMessageBtn">Send</button>
        </div>
      </div>
    );
  }
}

class UserListPart extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div class = "userListPart">
        <div class="title"><text>Online User List</text></div>
        <div id="userList" class="userList"></div>
      </div>
    );
  }
}

const element = (
  <React.StrictMode>
    <Toggle />
    <MainChatPart />
    <UserListPart />
  </React.StrictMode>
);

ReactDOM.render(
  element,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
