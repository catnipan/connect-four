import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga'
import { PageStatus, GamingStatus } from './status';
import rootSaga from './saga';
import getRoomNo from './get-room-no';

const sagaMiddleware = createSagaMiddleware();

const roomNo = getRoomNo();
const initialState = {
  page: roomNo == undefined ? PageStatus.Welcome : PageStatus.JoiningRoom,
  gaming: GamingStatus.Waiting,
  roomNo: roomNo,
  failReason: undefined,
  chatMessage: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_STATUS':
      return {
        ...state,
        page: action.payload,
        failReason: undefined,
        myTurn: undefined,
        waitTurn: undefined,
      }
    case 'PLAY_WITH_COMPUTER':
      return {
        ...state,
        page: PageStatus.PlayWithComputer,
        gaming: GamingStatus.Pending,
        outcome: undefined,
      }
    case 'RANDOM_PAIR':
      return {
        ...state,
        page: PageStatus.RandomPair,
        gaming: GamingStatus.Waiting,
        outcome: undefined,
      }
    case 'SET_RANDOM_PAIR_MATCHED':
      return {
        ...state,
        gaming: GamingStatus.Pending,
      }
    case 'SET_START_GAME':
      return {
        ...state,
        gaming: GamingStatus.Going,
        ready: false,
        myTurn: action.myTurn,
        waitTurn: 0, /* 0 starts first */
        outcome: undefined,
      }
    case 'SET_WAIT_TURN':
      return {
        ...state,
        waitTurn: action.waitTurn,
      }
    case 'SET_END_GAME':
      return {
        ...state,
        gaming: GamingStatus.Pending,
        outcome: action.outcome,
      }
    case 'SET_NEW_ROOM_CREATED':
      return {
        ...state,
        roomNo: action.roomNo,
        page: PageStatus.PlayWithFriends,
        outcome: undefined,
      }
    case 'SET_JOIN_ROOM_FAIL':
      return {
        ...state,
        failReason: action.payload,
      }
    case 'TRY_JOIN_ROOM':
      return  {
        ...state,
        failReason: undefined,
      }
    case 'SET_FRIEND_JOINED':
      return {
        ...state,
        gaming: GamingStatus.Pending,
      }
    case 'START_A_NEW_ROUND':
      return {
        ...state,
        ready: true,
      }
    case 'GET_NEW_CHAT_MESSAGE':
      return {
        ...state,
        chatMessage: [
          {
            key: action.chatMsgId,
            data: action.chatMsg,
          },
          ...state.chatMessage,
        ],
      }
    case 'REMOVE_CHAT_MESSAGE':
      return {
        ...state,
        chatMessage: state.chatMessage.filter(({ key }) => key != action.payload),
      }
    case 'SET_FRIEND_LEFT':
      return state.page == PageStatus.RandomPair ? {
        ...state,
        page: PageStatus.Welcome
      } : {
        ...state,
        gaming: GamingStatus.Waiting,
      }
    default:
      return state;
  }
};

const store = createStore(reducer, initialState, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

export default store;

