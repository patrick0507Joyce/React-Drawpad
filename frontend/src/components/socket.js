import io from 'socket.io-client'

const ENDPOINT = 'localhost:9999';

let socket = io(ENDPOINT, { transports: ['polling', 'websocket'] });

export default socket;