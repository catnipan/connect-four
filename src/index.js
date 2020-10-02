import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import GameCanvas from './game-canvas';
import server from './server';

GameCanvas.render('game-canvas');
ReactDOM.render(<App gameCanvas={GameCanvas} server={server} />, document.getElementById('app'));
