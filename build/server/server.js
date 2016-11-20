"use strict";
const env = require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 1337;
const bodyParser = require('body-parser');
const path = require('path');
const layouts_1 = require('./layouts');
const game_1 = require('./game');
// --------------- New Game Instance -----------------
// ---------------------------------------------------
const game = new game_1.Game(layouts_1.testLayout);
// ------------------ Middlewares --------------------
// ---------------------------------------------------
app.use(express.static(path.join(__dirname, '../../')));
app.use(bodyParser.json());
// ------------- Static Asset Routes -----------------
// ---------------------------------------------------
app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname + '/index.html'));
});
app.get('/gamestate', (req, res) => {
    const gameState = game.gameGetGameState();
    res.status(200).json(JSON.stringify(gameState.gameLayout));
});
app.get('/maptester', (req, res) => {
    res.status(200).sendFile(path.join(__dirname + '/../../maptester.html'));
});
// ----------------- Socket Stuff --------------------
// ---------------------------------------------------
io.on('connection', socket => {
    socket.on('newPlayer', playerName => {
        const player = game.gameAddNewPlayer(); // TODO add back in playerName once it's passed u p
        // socket['playerName'] = player.playerName;
    });
    socket.on('newMessage', data => {
        game.gameNewMessage(data.user, data.text, () => {
            socket.broadcast.emit('userMessage', data);
        });
    });
    socket.on('gameState', () => {
        game.gameGetGameState((data) => {
            socket.emit('gameState', data);
        });
    });
    socket.on('charState', () => {
        game.gameGetCharState((data) => {
            socket.emit('charState', data);
        });
    });
    socket.on('direction', direction => {
        game.gameMoveChar(direction, (data) => {
            // ok not to check for location value, cb won't get called if char can't move
            socket.emit('move', data);
        });
    });
    socket.on('disconnect', () => {
        // const playerName = socket['playerName'] || 'anonymous player';
        // game.gameDeletePlayer(); // TODO nothing behind this yet
        socket.broadcast.emit('playerLeft', `Guest has left the game`);
    });
});
// ---------------------------------------------------
http.listen(port, () => {
    console.log('Web server listening on port', port);
});
//# sourceMappingURL=server.js.map