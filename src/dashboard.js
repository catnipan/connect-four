import React, { useEffect, useState, Fragment } from 'react';
import { connect } from 'react-redux';
import { DiscreteInterpolant } from 'three';
import { PageStatus, GamingStatus } from './status';

function DotLoading() {
  const [c, updatec] = useState(0);
  useEffect(() => {
    const h = setTimeout(() => updatec(x => (x + 1) % 6), 1000);
    return () => clearTimeout(h);
  });

  return new Array(c + 1).fill('.').join('');
}

function Circle({ waitTurn, turn }) {
  if (waitTurn != undefined && waitTurn == turn) {
    return <div className={`circle ${turn == 0 ? 'circle_red' : 'circle_blue'}`}></div>;
  }
  return null;
}

function OutCome({ outcome }) {
  switch (outcome) {
    case 'TIE':
      return 'There\'s a tie!';
    case 'WIN':
      return 'You win!';
    case 'LOSE':
      return 'You lose.';
    default:
      return null;
  }
}

function DashBoard({ dispatch, state }) {
  const [roomNo, updateRoomNo] = useState('');
  const GoBackBtn = state.gaming == GamingStatus.Going ? (
    <button className="danger" onClick={() => {
      if (confirm('Are you sure to quit the game?')) {
        dispatch({ type: 'UPDATE_STATUS', payload: PageStatus.Welcome });
        dispatch({ type: 'RESET_GAME' });
        dispatch({ type: 'SEND_TO_SERVER', payload: '/leave_room' })
      }
    }}>
      X
    </button>
  ) : (
    <button onClick={() => {
      dispatch({ type: 'UPDATE_STATUS', payload: PageStatus.Welcome });
      dispatch({ type: 'RESET_GAME' });
      dispatch({ type: 'SEND_TO_SERVER', payload: '/leave_room' })
    }}>
      ←
    </button>
  );
  const [chatMsg, updateChatMsg] = useState('');
  const [msg, updateMsg] = useState('');
  const sendChatMessage = () => {
    updateChatMsg(''); // reset
    dispatch({ type: 'SEND_TO_SERVER', payload: `/chat ${chatMsg}` });
  };
  switch (state.page) {
    case PageStatus.JoiningRoom:
      return (
        <div>
          {
            state.failReason
            ? (
              <div>
                <h2>Join Room Failed</h2>
                <p>{state.failReason}</p>
                <p>
                  <button onClick={() => dispatch({
                  type: 'UPDATE_STATUS',
                  payload: PageStatus.Welcome
                  })}>Go Back</button>
                </p>
              </div>
            ) : (
              <h2>Joining room {state.roomNo}<DotLoading /></h2>
            )
          }
        </div>
      );
    case PageStatus.Welcome:
      return (
        <div>
          <h1>Connect Four</h1>
          <button onClick={() => dispatch({ type: 'PLAY_WITH_COMPUTER' })}>
            Play With Computer
          </button>
          <button onClick={() => dispatch({ type: 'UPDATE_STATUS', payload: PageStatus.PreparePlayWithFriends })}>
            Play With Friend
          </button>
          <button onClick={() => dispatch({ type: 'RANDOM_PAIR' })}>
            Random Pair
          </button>
        </div>
      );
    case PageStatus.PlayWithComputer:
      return (
        <div>
          <div className="header">
            <div className="left"></div>
            <div className="right">
              {GoBackBtn}
            </div>
          </div>
          <div className="gaming">
            <div className="player">
              <h2>me</h2>
              <Circle waitTurn={state.waitTurn} turn={state.myTurn} />
            </div>
            <div className="status">
                {state.gaming == GamingStatus.Pending
                  ? (
                    state.outcome ?
                      <Fragment>
                        <h2><OutCome outcome={state.outcome} /></h2>
                        <button onClick={() => dispatch({ type: 'START_A_NEW_ROUND' })}>Start a new round</button>
                      </Fragment>
                    : (
                      <Fragment>
                        <h2>v.s.</h2>
                        <button onClick={() => dispatch({ type: 'START_A_NEW_ROUND' })}>I'm ready</button>
                      </Fragment>
                    )
                  ) : <h2>v.s.</h2>
                }
            </div>
            <div className="player">
              <h2>computer</h2>
              <Circle waitTurn={state.waitTurn} turn={1 - state.myTurn} />
            </div>
          </div>
        </div>
      )
    case PageStatus.PreparePlayWithFriends:
      return (
        <div>
          <div className="header">
            <div className="left"></div>
            <div className="right">
              {GoBackBtn}
            </div>
          </div>
          <div>
            <h2>Play with friends</h2>
            <p>You can<button onClick={() => dispatch({ type: 'SEND_TO_SERVER', payload: '/create_new_room' })}>Create a room</button>and ask friend to join</p>
            <p>or join a room created by friends <input onChange={ev => updateRoomNo(ev.target.value)} type="text" value={roomNo} className="left-part"/><button className="right-part" onClick={() => {
              dispatch({ type: 'TRY_JOIN_ROOM', roomNo });
            }}>Join</button>{state.failReason && `Join room fail: ${state.failReason}`}</p>
          </div>
        </div>
      );
    case PageStatus.PlayWithFriends:
      return state.gaming == GamingStatus.Waiting ? (
        <div>
          <div className="header">
            <div className="left">
              Room created:
              <input id="roomNo" defaultValue={state.roomNo} style={{ width: '4em' }}/>
              , ask your friend to join!
              <input id="roomLink" defaultValue={`${window.location.href.split('?')[0]}?room=${state.roomNo}`} className="left-part" />
              <button className="right-part" onClick={() => {
                var copyText = document.getElementById('roomLink');
                copyText.select();
                document.execCommand("copy");
              }}>
                Copy
              </button>
            </div>
            <div className="right">
              <button onClick={() => {
                dispatch({ type: 'SEND_TO_SERVER', payload: '/leave_room' });
                dispatch({ type: 'UPDATE_STATUS', payload: PageStatus.PreparePlayWithFriends });
              }}>
                Quit Inviting
              </button>
            </div>
          </div>
          <div>
            <h2>Waiting For friend to join<DotLoading /></h2>
          </div>
        </div>
      ) : (
        <div>
          <div className="header">
            <div className="left">
              <input
                id="chat-box"
                value={chatMsg}
                onChange={e => updateChatMsg(e.target.value)}
                className="chat-input"
                onKeyDown={e => {
                  if (e.key == 'Enter') sendChatMessage();
                }}
              />
              <button onClick={() => {
                sendChatMessage();
                document.getElementById("chat-box").focus();
              }}>Send</button>
            </div>
            <div className="right">
              {GoBackBtn}
            </div>
          </div>
          <div>
            <div className="gaming">
              <div className="player">
                <h2>me</h2>
                <Circle waitTurn={state.waitTurn} turn={state.myTurn} />
              </div>
              <div className="status">
                {(state.gaming == GamingStatus.Pending && state.outcome) ? (
                  <h2><OutCome outcome={state.outcome} /></h2>
                ) : (
                  <h2>v.s.</h2>
                )}
                {state.gaming == GamingStatus.Pending && (
                  state.ready
                    ? <button className="disabled">Waiting For Opponent To Be Ready</button>
                    : <button onClick={() => dispatch({ type: 'START_A_NEW_ROUND' })}>
                        {state.outcome ? "Ready for another round" : "I'm Ready"}
                      </button>
                )}
              </div>
              <div className="player">
                <h2>Opponent</h2>
                <Circle waitTurn={state.waitTurn} turn={1 - state.myTurn} />
              </div>
            </div>
          </div>
        </div>
      );
    case PageStatus.RandomPair:
      return state.gaming == GamingStatus.Waiting ? (
        <div>
          <div className="header">
            <div className="left"></div>
            <div className="right">
              <button onClick={() => {
                dispatch({ type: 'UPDATE_STATUS', payload: PageStatus.Welcome });
                dispatch({ type: 'SEND_TO_SERVER', payload: '/leave_pool' });
              }}>
                ←
              </button>
            </div>
          </div>
          <div>
            <h2>Waiting to be paired<DotLoading /></h2>
          </div>
        </div>
      ) : (
        <div>
          <div className="header">
            <div className="left"></div>
            <div className="right">
              <button className="danger" onClick={() => {
                dispatch({ type: 'UPDATE_STATUS', payload: PageStatus.Welcome });
                dispatch({ type: 'SEND_TO_SERVER', payload: '/leave_room' });
              }}>
                x
              </button>
            </div>
          </div>
          <div>
            <div className="gaming">
              <div className="player">
                <h2>me</h2>
                <Circle waitTurn={state.waitTurn} turn={state.myTurn} />
              </div>
              <div className="status">
                {(state.gaming == GamingStatus.Pending && state.outcome) ? (
                  <h2><OutCome outcome={state.outcome} /></h2>
                ) : (
                  <h2>v.s.</h2>
                )}
                {state.gaming == GamingStatus.Pending && (
                  state.ready
                    ? <button className="disabled">Waiting For Opponent To Be Ready</button>
                    : <button onClick={() => dispatch({ type: 'START_A_NEW_ROUND' })}>
                        {state.outcome ? "Ready for another round" : "I'm Ready"}
                      </button>
                )}
              </div>
              <div className="player">
                <h2>Opponent</h2>
                <Circle waitTurn={state.waitTurn} turn={1 - state.myTurn} />
              </div>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default connect(state => ({ state }))(DashBoard);

