import React from 'react';
import ReactDOM from 'react-dom';
import DashBoard from './dashboard';
import ChatMessage from './chat-message';
import 'regenerator-runtime/runtime';
import GameCanvas from './game-canvas/index';
import { createStore } from 'redux';
import { connect } from 'react-redux'
import store from './store';
import { Provider } from 'react-redux'
import "./style.css";

GameCanvas.render('game-canvas');

ReactDOM.render(
  <Provider store={store}>
    <div>
      <ChatMessage />
      <div className="wrapper">
        <DashBoard gameCanvas={GameCanvas} />
      </div>
    </div>
  </Provider>,
  document.getElementById('dashboard')
);
