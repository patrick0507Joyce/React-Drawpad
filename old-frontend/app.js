let ws = null;
let isConnected = false;

let setNameBtn = document.getElementById('setNameBtn');
setNameBtn.onclick = ()=> {

    //establish connection after set user name
    //ws = new WebSocket('ws://127.0.0.1:5000');
    let groupInfo = document.getElementById('chatRoom');

    //on opening connection for the first time
    ws = io('http://localhost:5000');
    let data = {
        type: 'setNameEvent',
        userName: userName.value
    };

    ws.on('established', function (msg) {
        let rep = msg;

        let join_group_msg = {
            type: groupInfo.value,
            userName: userName.value
        };
        ws.emit('join', join_group_msg);
        isConnected = true;
        sendMessageWithParam(data);
        //disable user from changing the username
        let userNameBtn = document.getElementById('setNameBtn');
        userNameBtn.setAttribute("disabled", true);
    });

    ws.on('responseMessage', function (msg) {
        let data = JSON.parse(JSON.stringify(msg));
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
                refreshUserListDivision(data);
                break;
            default:
                break;
        }
    });
};



let sendMessageBtn = document.getElementById('sendMessageBtn');

sendMessageBtn.onclick = () => {
    if (isConnected) {
        sendMessageWithoutParam();
    }
    else {
        alert("set user name first!");
    }
};



