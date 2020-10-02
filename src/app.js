import React, { useEffect, useState, Fragment } from 'react';

const Status = {
  Welcome: Symbol(),
  Gaming: Symbol(),
  GameEnd: Symbol(),
  Friends: Symbol(),
  RoomCreated: Symbol(),
  FriendJoined: Symbol(),
  // JoinSuccess: Symbol(),
  Pool: Symbol(),
};

const defaultCount = new Array(7).fill(0);

function App({ gameCanvas, server }) {
  const [count, updateCount] = useState(defaultCount); // game state
  const [currTurn, updateCurrTurn] = useState(0);
  const [myTurn, setMyTurn] = useState(undefined);
  const [status, updateStatus] = useState(Status.Welcome);
  const [winner, updateWinner] = useState(2);
  const [roomNo, updateRoomNo] = useState('');
  const [ready, updateReady] = useState(false);
  const getIsValid = col => {
    return myTurn == currTurn && count[col] < 6;
  };
  const [incomingChatMsg, updateIncomingChatMsg] = useState('');
  const onClick = col => {
    if (getIsValid(col)) {
      server.send(`/move ${col}`);
    }
  };
  // '/create_new_room'
  // '/move'
  // '/play_with_computer'
  // '/join_room'
  // '/chat'
  // '/leave_room'
  // '
  const handle_func = {
    'NEW_ROOM_CREATED': (roomNo) => {
      updateStatus(Status.RoomCreated);
      updateRoomNo(roomNo);
    },
    'NEW_MOVE': (row, col, turn) => {
      const r = parseInt(row), c = parseInt(col), t = parseInt(turn);
      updateCount(() => {
        const newcount = [...count];
        newcount[c]++;
        return newcount;
      });
      gameCanvas.add(r, c, t);
    },
    'ROOM_JOIN_SUCCESS': () => {
    },
    'ROOM_JOIN_FAIL': (failReason) => {
      alert("Join room failed!");
    },
    'GAME_END': (outcome, player, r1, c1, r2, c2, r3, c3, r4, c4) => {
      updateWinner(outcome == "TIE" ? 2 : parseInt(player));
      updateStatus(Status.GameEnd);
    },
    'FRIEND_JOINED': () => {
      updateStatus(Status.FriendJoined);
    },
    'FRIEND_LEFT': () => {},
    'GAME_START': (myTurn) => {
      gameCanvas.clear();
      updateReady(false);
      updateCount(defaultCount);
      setMyTurn(parseInt(myTurn));
      updateStatus(Status.Gaming);
    },
    'WAIT_TURN': (currTurn) => {
      updateCurrTurn(parseInt(currTurn));
    },
    'CHAT': (...chatMsg) => {
      updateIncomingChatMsg(chatMsg.join(' '));
    },
  };
  const onServerMessage = (e) => {
    // ["GAME END", ???]
    const data = e.data.split(' ');
    if (data.length >= 1) {
      const command = data.shift();
      const h = handle_func[command];
      if (h) h(...data);
    }
  };
  const getReady = () => {
    server.send(`/ready`);
    updateReady(true);
  }
  useEffect(() => {
    gameCanvas.setController({
      onClick,
      getIsValid,
    });
    server.onMessage(onServerMessage);
    return () => {
      gameCanvas.clearController();
    }
  });
  const [chatMsg, updateChatMsg] = useState('');
  const [msg, updateMsg] = useState('');
  return (
    <Fragment>
      {status == Status.Welcome && (
        <div>
          <a onClick={() => server.send('/play_with_computer')}>Play With Computer</a>
          <a onClick={() => updateStatus(Status.Friends)}>Play With Friend</a>
          <a onClick={() => {
            updateStatus(Status.Pool);
            server.send('/join_pool');
          }}>Play With Strangers</a>
        </div>
      )}
      {status == Status.Friends && (
        <div>
          <a onClick={() => server.send('/create_new_room')}>create a new room</a>
          or join a room
          <input value={roomNo} onChange={e => updateRoomNo(e.target.value)}></input>
          <a onClick={() => server.send(`/join_room ${roomNo}`)}>join room</a>
        </div>
      )}
      {status == Status.RoomCreated && (
        <div>
          Your room number is {roomNo}, ask your friend to join.
        </div>
      )}
      {status == Status.FriendJoined && (
        <div>
          Opponent has joined. Waiting to get started!
          <a onClick={getReady} className={ready ? "disable" : ""}>I'm ready.</a>
        </div>
      )}
      {status == Status.Gaming && (
        <div>
          {currTurn == myTurn ?
            <div>It's your turn.</div>
            : <div>Waiting for opponents' move.</div>
          }
          <input value={chatMsg} onChange={e => {
            updateChatMsg(e.target.value);
          }}></input>
          <a onClick={() => {
            server.send(`/chat ${chatMsg}`);
            updateChatMsg('');
          }}>send</a>
          <div>{incomingChatMsg}</div>
        </div>
      )}
      {status == Status.GameEnd && (
        <div>
          {winner == 2 ?
            <div>It's a tie.</div>
            : <div>{winner == myTurn ? "You win!" : "You lose"}</div>
          }
          <a onClick={getReady} className={ready ? "disable" : ""}>Try a new round!</a>
        </div>
      )}
      {status == Status.Pool && (
        <div>
          Waiting to be paired...
        </div>
      )}
    </Fragment>
  )
}



export default App;

