let ws = null;
let isConnected = false;

//Encapsulating time function
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

const createMessageDivision = (data) => {
    let division = document.createElement('div');
    let p_message_time = document.createElement('p');
    let p_message_content = document.createElement('p');
    //Two types of events: receiving new message or user enter / left room
    switch (data.type) {
        case 'messageEvent':
            p_message_time.innerHTML = new Date().Format("yyyy-MM-dd hh:mm:ss");
            if(data.message) {
                p_message_content.innerHTML = data.message;
            }
            else {
                p_message_content.innerHTML = "Unrecoginzed message";
            }
            break;
        case 'userChangeInfoMessageEvent':
            p_message_time.innerHTML = new Date().Format("yyyy-MM-dd hh:mm:ss");
            if(data.message) {
                p_message_content.innerHTML = data.message;
            }
            else {
                p_message_content.innerHTML = "Unrecoginzed message";
            }
            break;
        default:
            break;
    }
    p_message_time.setAttribute('class', 'time');
    p_message_content.setAttribute('class', 'content');

    division.appendChild(p_message_time);
    division.appendChild(p_message_content);

    let messagePartContent = document.getElementById('content');
    messagePartContent.appendChild(division)
};

const refreshUserListDivision = (data) => {
    let currentUserList = data.list;
    let currentUserListLength = data.list.length;
    let oldUserList = document.getElementById('userList');

    //change the title here
    document.getElementById('onlineUserCount').innerText = `Online User ${length} in total`;

    //clear the old user part for refreshing
    oldUserList.innerHTML = '';

    for (let i = 0; i < currentUserListLength; i++) {
        let p_user = document.createElement('p');
        p_user.setAttribute('class','userList-item');
        p_user.innerText = currentUserList[i].name;
        oldUserList.append(p_user);
    }
};

const sendMessage = () => {
    let messageContent = document.getElementById('message');

    let data = {
        type: 'messageEvent',
        message: messageContent.value
    };
    ws.emit('message', data);
    messageContent.value = '';
};

const sendMessageWithParam = (msg) => {
    let messageContent = msg;

    ws.emit('message', msg);
    messageContent.value = '';
};

let setNameBtn = document.getElementById('setNameBtn');
setNameBtn.onclick = ()=> {
    let userName = document.getElementById('userName');

    //establish connection after set user name
    //ws = new WebSocket('ws://127.0.0.1:5000');

    //on opening connection for the first time
    ws = io('http://localhost:5000');
    let data = {
        type: 'setNameEvent',
        userName: JSON.stringify(userName.value)
    };

    ws.emit('establishConnection');

    ws.on('connected', function (msg) {
        console.log("connected with session id: " + msg);
        isConnected = true;
        sendMessageWithParam(data);
        //disable user from changing the username
        let userNameBtn = document.getElementById('setNameBtn');
        userNameBtn.setAttribute("disabled", true);
    });



    ws.on('responseMessage', function (msg) {
        let data = msg;
        console.log("client receiving " + data);
        let data_type = data['type'];
        switch (data_type) {
            case 'setNameEvent':
                refreshUserListDivision(data);
                break;
            case 'messageEvent':
                createMessageDivision(data);
                break;
            case 'userChangeInfoMessageEvent':
                createMessageDivision(data);
                break;
            default:
                break;
        }
    });
};



let sendMessageBtn = document.getElementById('sendMessageBtn');

sendMessageBtn.onclick = () => {
    if (isConnected) {
        sendMessage();
    }
    else {
        alert("set user name first!");
    }
};



