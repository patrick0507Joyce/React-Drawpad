import io from 'socket.io-client'

const ENDPOINT = 'localhost:5000';

let socket = io(ENDPOINT, { transports: ['websocket'] });

export default socket;