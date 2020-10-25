const sendMessageWithoutParam = () => {
    let messageContent = document.getElementById('message');

    let data = {
        type: 'messageEvent',
        message: messageContent.value
    };
    ws.emit('requestMessage', data);
    messageContent.value = '';
};

const sendMessageWithParam = (msg) => {
    let messageContent = msg;

    ws.emit('requestMessage', msg);
    messageContent.value = '';
};