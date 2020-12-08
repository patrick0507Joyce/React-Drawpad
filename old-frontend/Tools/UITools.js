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
    let currentUserList = data['groupMembers'];
    if (!currentUserList.length)
        return;
    let currentUserListLength = currentUserList.length;
    let oldUserList = document.getElementById('userList');

    //change the title here
    document.getElementById('onlineUserCount').innerText = `Online User ${length} in total`;

    //clear the old user part for refreshing
    oldUserList.innerHTML = '';

    for (let i = 0; i < currentUserListLength; i++) {
        let p_user = document.createElement('p');
        p_user.setAttribute('class','userList-item');
        p_user.innerText = currentUserList[i];
        oldUserList.append(p_user);
    }
};