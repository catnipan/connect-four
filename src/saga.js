import { call, put, takeEvery, take, delay, takeLatest, select, fork } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';
import gameCanvas from './game-canvas';
import { PageStatus } from './status';
import getRoomNo from './get-room-no';

function createWebSocketConnection() {
  return new Promise((resolve, reject) => {
    const { location } = window;
    const proto = location.protocol.startsWith('https') ? 'wss' : 'ws';
    const wsUri = `${proto}://${location.host}/api/g/connect-four`;
    // const wsUri = `ws://localhost:3000/api/g/connect-four`;
    const socket = new WebSocket(wsUri);
    socket.onopen = () => {
      resolve(socket);
    }
    socket.onerror = (event) => {
      reject(event);
    }
  });
}

function createSocketChannel(socket) {
  return eventChannel(emit => {
    socket.onmessage = (event) => {
      emit(event.data)
    };
    socket.onclose = () => {
      emit(END);
    };
    const unsubscribe = () => {
      socket.onmessage = null;
    };
    return unsubscribe;
  });
}

function createGameCanvasChannel(gameCanvas) {
  return eventChannel(emit => {
    gameCanvas.onClickColumnEvent = (column) => {
      emit(column)
    };
    return () => {
      gameCanvas.onClickColumnEvent = () => {};
    };
  });
}

const handlerMap = {
  GAME_START: function*(myTurn) {
    yield put({ type: 'RESET_GAME' });
    yield put({ type: 'SET_START_GAME', myTurn: parseInt(myTurn) });
  },
  WAIT_TURN: function*(waitTurn) {
    yield put({ type: 'SET_WAIT_TURN', waitTurn: parseInt(waitTurn) });
  },
  NEW_MOVE: function*(row, col, turn) {
    yield call(gameCanvas.add, parseInt(row), parseInt(col), parseInt(turn));
  },
  GAME_END: function*(outcome, winner, keymoves) {
    const myTurn = yield select(state => state.myTurn);
    winner = parseInt(winner);
    keymoves = JSON.parse(keymoves);
    const userOutcome = (outcome === "TIE") ? "TIE" : (winner == myTurn ? "WIN" : "LOSE");
    yield put({
      type: 'SET_END_GAME',
      outcome: userOutcome,
    });
    if (outcome != "TIE") {
      for (let [r, c] of keymoves) {
        yield call(gameCanvas.annotate, r, c, winner);
        yield delay(100);
      }
    }
  },
  NEW_ROOM_CREATED: function*(roomNo) {
    yield put({
      type: 'SET_NEW_ROOM_CREATED',
      roomNo,
    })
  },
  ROOM_JOIN_FAIL: function*(failReason) {
    yield put({
      type: 'SET_JOIN_ROOM_FAIL',
      payload: failReason,
    })
  },
  ROOM_JOIN_SUCCESS: function*() {
    yield put({
      type: 'UPDATE_STATUS',
      payload: PageStatus.PlayWithFriends
    });
  },
  FRIEND_JOINED: function*() {
    yield put({
      type: 'SET_FRIEND_JOINED',
    });
  },
  CHAT: (function() {
    let chatMsgId = 0;
    return function*(chatMsg) {
      chatMsgId += 1;
      yield put({
        type: 'GET_NEW_CHAT_MESSAGE',
        chatMsg,
        chatMsgId,
      });
      yield fork(cleanChatMsg, chatMsgId);
    }
  })(),
  FRIEND_LEFT: function*() {
    yield call(alert, 'Opponent just quitted the game.');
    yield put({ type: 'SET_FRIEND_LEFT' });
    yield put({ type: 'RESET_GAME' });
  },
  RANDOM_PAIR_MATCHED: function*() {
    yield put({ type: 'SET_RANDOM_PAIR_MATCHED' });
  }
}

function* cleanChatMsg(chatMsgId) {
  yield delay(20000);
  yield put({ type: 'REMOVE_CHAT_MESSAGE', payload: chatMsgId });
}

function* listenToChannel(socketChannel) {
  while (true) {
    const payload = yield take(socketChannel);
    const data = payload.split(' ');
    if (data.length >= 1) {
      const command = data.shift();
      const handler = handlerMap[command];
      if (handler) {
        yield fork(handler, ...data);
      }
    }
  }
}

function* webSocket() {
  let socket = undefined;
  let socketChannel = undefined;
  while (true) {
    const action = yield take('SEND_TO_SERVER');
    console.log('send-to-server: ', action.payload);
    if (socket == undefined) {
      socket = yield call(createWebSocketConnection);
      socketChannel = yield call(createSocketChannel, socket);
      yield fork(listenToChannel, socketChannel);
    }
    yield call([socket, socket.send], action.payload);
  }
}

function* gameCanvasChannel() {
  const channel = yield call(createGameCanvasChannel, gameCanvas);
  while (true) {
    const column = yield take(channel);
    const { waitTurn, myTurn } = yield select();
    if (waitTurn === myTurn && myTurn != undefined) {
      yield put({ type: 'SEND_TO_SERVER', payload: `/move ${column}` });
    }
  }
}

// function* handleSendToServer({ payload }) {
//   yield call(server.send, payload);
// }

function* rootSaga() {
  yield fork(webSocket);
  yield fork(gameCanvasChannel);
  yield takeEvery('*', function*(action) {
    console.log('action', action);
  });
  yield takeEvery('START_A_NEW_ROUND', function* () {
    yield put({ type: 'SEND_TO_SERVER', payload: `/ready` });
  });
  yield takeEvery('TRY_JOIN_ROOM', function* ({ roomNo }) {
    yield put({ type: 'SEND_TO_SERVER', payload: `/join_room ${roomNo}` });
  });
  yield takeEvery('RESET_GAME', function* () {
    yield call(gameCanvas.clear);
  });
  yield takeEvery('PLAY_WITH_COMPUTER', function*(){
    yield put({ type: 'SEND_TO_SERVER', payload: '/play_with_computer' });
  });
  yield takeEvery('RANDOM_PAIR', function*() {
    yield put({ type: 'SEND_TO_SERVER', payload: '/join_pool' });
  })
  /* join room link */
  const roomNo = yield call(getRoomNo);
  if (roomNo != undefined) {
    yield put({ type: 'TRY_JOIN_ROOM', roomNo });
  }
}

export default rootSaga;


// const handle_func = {
//   'NEW_ROOM_CREATED': (roomNo) => {
//     // updateStatus(Status.RoomCreated);
//     updateRoomNo(roomNo);
//   },
//   'NEW_MOVE': (row, col, turn) => {
//     const r = parseInt(row), c = parseInt(col), t = parseInt(turn);
//     updateCount(() => {
//       const newcount = [...count];
//       newcount[c]++;
//       return newcount;
//     });
//     gameCanvas.add(r, c, t);
//   },
//   'ROOM_JOIN_SUCCESS': () => {
//   },
//   'ROOM_JOIN_FAIL': (failReason) => {
//     alert("Join room failed!");
//   },
//   'GAME_END': (outcome, player, r1, c1, r2, c2, r3, c3, r4, c4) => {
//     updateWinner(outcome == "TIE" ? 2 : parseInt(player));
//     updateStatus(Status.GameEnd);
//   },
//   'FRIEND_JOINED': () => {
//     updateStatus(Status.FriendJoined);
//   },
//   'FRIEND_LEFT': () => {},
//   'GAME_START': (myTurn) => {
//     gameCanvas.clear();
//     updateReady(false);
//     updateCount(defaultCount);
//     setMyTurn(parseInt(myTurn));
//     updateStatus(Status.Gaming);
//   },
//   'WAIT_TURN': (currTurn) => {
//     updateCurrTurn(parseInt(currTurn));
//   },
//   'CHAT': (...chatMsg) => {
//     updateIncomingChatMsg(chatMsg.join(' '));
//   },
// };
// const onServerMessage = (e) => {
//   // ["GAME END", ???]
//   const data = e.data.split(' ');
//   if (data.length >= 1) {
//     const command = data.shift();
//     const h = handle_func[command];
//     if (h) h(...data);
//   }
// };