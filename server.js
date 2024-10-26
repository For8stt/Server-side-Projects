// server.js
// Yulian Kisil id:128371
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



function updateGameState(action, playerId) {
    if (!gameStates[playerId]) {
        // Якщо стан гри для цього гравця ще не існує, створіть його
        gameStates[playerId] = {
            missiles: [],
            lasers: [],
            ship: {
                x: 29, // Початкове x
                y: 29, // Початкове y
                r: 0, // Початкова ротація
            },
            score: 0,
            speed: 1000,
            counter: 0,
        };
    }

    switch (action.action) {
        case 'rotateShip':
            gameStates[playerId].ship.r=serverFunction.rotateShip(gameStates[playerId].ship.r,action.direction)// Обертаємо корабель
            break;
        case 'addLaser':
            gameStates[playerId].lasers.push({ x: gameStates[playerId].ship.x, y: gameStates[playerId].ship.y }); // Додаємо лазер
            break;
    }
}
// function rotateShip(rShip,rotation) {
//     if(rotation > 0) rShip = (rShip+1)%8;
//     else if(rotation < 0) {
//         if(rShip===0) rShip = 7;
//         else rShip = rShip - 1;
//     }
//     return rShip
// }

// WebSocket логіка
wss.on('connection', (client) => {
    const playerId = playerIdCounter++;
    players[playerId] = client;

    console.log(`Новий користувач підключений: ID=${playerId}`);
    client.send(JSON.stringify({ message: 'connection', playerId: playerId }));

    client.on('message', (message) => {
        console.log(`Отримано повідомлення від ID=${playerId}: ${message}`);
        const action = JSON.parse(message);

        updateGameState(action, playerId); // Оновлюємо стан гри для конкретного гравця
        console.log(gameStates[playerId])
        // Відправляємо оновлений стан гри тільки цьому користувачеві
        client.send(JSON.stringify(gameStates[playerId]));
    });
});
