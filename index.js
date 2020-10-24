let ws = null;

//封装获取时间的函数

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

const createMessageDiv = (data)=> {
    let div = document.createElement('div');
    let p_time = document.createElement('p');
    let p_content = document.createElement('p');
    switch (data.type) {
        case 'userChangeInfoMessageEvent':
            p_time.innerHTML = new Date().Format("yyyy-MM-dd hh:mm:ss");
            p_content.innerHTML = data.message;
            break;
        case  'messageEvent':
            p_time.innerHTML = new Date().Format("yyyy-MM-dd hh:mm:ss");
            p_content.innerHTML = data.name+":"+data.message;
            break;
        default:
            break;
    }

    p_time.setAttribute('class','time');
    p_content.setAttribute('class','content');

    div.appendChild(p_time);
    div.appendChild(p_content);

    return div;
};

const appendUserDiv = (data) => {
    let list = data.list;
    let length = list.length;
    let userList = document.getElementById('userList');
    //change the title here
    document.getElementById('onlineUserCount').innerText = `Online User ${length} in total`;

    userList.innerHTML = '';
    for(let i=0;i<list.length;i++) {
        let p_user = document.createElement('p');
        p_user.setAttribute('class','userList-item');
        p_user.innerText = list[i].name;
        userList.append(p_user);
    }
};

const send = ()=> {
    let message = document.getElementById('message');

    if(!message.value){
        return
    }
    let data = {
        type:'messageEvent',
        message:message.value
    };
    ws.send(JSON.stringify(data));
    message.value = ""
};

let setNameBtn = document.getElementById('setNameBtn');
setNameBtn.onclick = ()=> {
    let userName = document.getElementById('userName');
    let nickName = "Default Nick Name";
    if (userName.value) {
        nickName = userName.value;
    }


    //establish connection after set user name
    ws = new WebSocket('ws://127.0.0.1:5000');

    //on opening connection for the first time
    ws.onopen = () => {
        let data = {
            type: 'setNameEvent',
            nickname: nickName
        };
        ws.send(JSON.stringify(data))
    };

    //on sending message
    let sendMessageBtn = document.getElementById('sendMessageBtn');

    sendMessageBtn.onclick = () => {
        send();
    };

    //on receiving message from server
    ws.onmessage = (e) => {
        let data = JSON.parse(e.data);
        console.log(data);
        switch (data.type)
        {
            case 'setNameEvent':
                appendUserDiv(data);
                break;
            case 'messageEvent':
                let messagePartContent = document.getElementById('content');
                messagePartContent.appendChild(createMessageDiv(data))
                break;
            case 'userChangeInfoMessageEvent':
                messagePartContent = document.getElementById('content');
                messagePartContent.appendChild(createMessageDiv(data))
                break;
            default:
                break;
        }

        let userName = document.getElementById('userName');
        userName.setAttribute('disabled',true);
        let userNameBtn = document.getElementById('setNameBtn');
        userNameBtn.setAttribute("disabled", true);
    };
}