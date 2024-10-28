// server.js
// Yulian Kisil id:128371
module.exports={
    endGame,
}

const serverFunction =require('./serverfunction');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const bcrypt = require('bcrypt');

const app = express();
const port = 8080; // HTTP порт
const WSport = 8082; // WS порт
const server = http.createServer(app);
const wss = new WebSocket.Server({ port: WSport });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

server.listen(port, () => {
    console.log(`HTTP-сервер запущено на http://localhost:${port}`);

});


let gameStates = {}; // Об'єкт для зберігання стану гри користувачів
let players = {};
let playerIdCounter = 0;


app.post('/action', (req, res) => {
    const { playerId, action } = req.body;

    if (!gameStates[playerId]) {
        return res.status(400).json({ error: 'Гравець не знайдений' });
    }

    // Оновлення стану гри на основі дії
    updateGameState(action, playerId);

    // Відповідаємо клієнту
    res.json({ success: true });

    // Відправляємо оновлений стан гри цьому клієнту через WebSocket
    const client = players[playerId];
    if (client && client.readyState === WebSocket.OPEN) {
        const gameStateToSend = { ...gameStates[playerId] };

        client.send(JSON.stringify(gameStateToSend));
    }
});

function updateGameState(action, playerId) {
    // Логіка оновлення стану гри для конкретного гравця
    if (action.action === 'rotateShip') {
        gameStates[playerId].ship.r =serverFunction.rotateShip(gameStates[playerId].ship.r,action.direction);
    } else if (action.action === 'addLaser') {
        gameStates[playerId].lasers.push(serverFunction.addLaser(gameStates[playerId].ship.r));
    }
}

wss.on('connection', (client) => {
    const playerId = playerIdCounter++;
    players[playerId] = client;

    console.log(`Новий користувач підключений: ID=${playerId}`);
    client.send(JSON.stringify({ message: 'connection', playerId: playerId }));

    gameStates[playerId] = {
        missiles: [],
        lasers: [],
        ship: {
            x: 29,
            y: 29,
            r: 0,
        },
        score: 0,
        speed: 1000,
        counter: 0,
    };

    preGame(playerId);
});





var startGame = (playerId) => {
    mainLoop(playerId);
};

let preGame = (playerId) => {
    var countdown = 5;
    for(var i=0;i<countdown;i++) {
        ((i)=>{
            setTimeout(()=>{
//                 console.log(countdown-i);
            },i*1000);
        })(i);
    }
    setTimeout(()=>{
        startGame(playerId);
    },(countdown+1)*1000);
};

function endGame(playerId) {
    console.log('user end the game:'+playerId)
    clearInterval(intervalId[playerId]);
}
let intervalId=[];
function mainLoop(playerId) {
    intervalId[playerId] = setInterval(() => {
        gameStates[playerId].missiles=serverFunction.moveMissiles(playerId,gameStates);
        gameStates[playerId]=serverFunction.moveLasers(playerId,gameStates);
        gameStates[playerId].counter++;
        gameStates[playerId].score += 10;

        const client = players[playerId];
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(gameStates[playerId]));
        }

        if (gameStates[playerId].counter % 5 === 0) gameStates[playerId].missiles=serverFunction.addMissile(playerId,gameStates);
        if (gameStates[playerId].counter % 20 === 0) {
            clearInterval(intervalId[playerId]);
            gameStates[playerId].speed = Math.round(gameStates[playerId].speed / 2);
            mainLoop(playerId);
        }
    }, gameStates[playerId].speed);
}

