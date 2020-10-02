const { location } = window;
const proto = location.protocol.startsWith('https') ? 'wss' : 'ws';
// const wsUri = `${proto}://${location.host}/api/games/connect-four/`;
const wsUri = `ws://localhost:3000/game/connect-four`

const noop = () => {};

let socket = null;
let connected = false;
let messageHandler = noop;

const reset = () => {
  connected = false;
  messageHandler = noop;
  socket = null;
}

const connect = (then = noop) => {
  if (socket) {
    socket.close();
    reset();
  }
  socket = new WebSocket(wsUri);
  socket.onopen = () => {
    connected = true;
    then();
  }
  socket.onmessage = (ev) => {
    console.log('Send:', ev.data);
    messageHandler(ev);
  }
  socket.onclose = () => {
    reset();
  }
};

const send = (data) => {
  if (connected) {
    console.log('Send:', data);
    socket.send(data);
  } else {
    connect(() => send(data));
  }
}

const onMessage = handler => {
  messageHandler = handler;
}

export default {
  onMessage,
  send,
};