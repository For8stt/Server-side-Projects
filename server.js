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
let users=[];


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

app.post('/start-game', (req, res) => {
    const { playerId } = req.body;

    // Перевірка наявності ID гравця
    if (!gameStates[playerId]) {
        return res.status(400).json({ error: 'Гравець не знайдений' });
    }

    const allUsersInfo = users.filter(user => user.score !== undefined).map(user => ({
            username: user.username,
            score: user.score
        }));


    // Запускаємо гру для цього гравця
    preGame(playerId);

    // Відповідаємо клієнту
    res.json({ success: true, message: 'Game started successfully!' , users:allUsersInfo});
});
app.post('/registration', (req, res) => {
    const { playerId ,username, email, password} = req.body;

    if (!gameStates[playerId]) {
        return res.status(500).json({ error: 'Player not found' });
    }
    if (!validateEmail(email) || !validatePassword(password)) {
        return res.status(500).json({ error: 'Incorrect email format or password' });
    }
    const userExists = users.some(user => user.username === username || user.email === email);
    if (userExists) {
        return res.status(500).json({ error: 'Username or email already exists' });
    }
    console.log(playerId,username,email,password)
    const newUser = {playerId: playerId, username: username, email: email, password: password};
    users.push(newUser);

    res.json({ success: true});
});
function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]{3,}\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        return false;
    }
    return true;
}
function validatePassword(password) {
    return /^[a-zA-Z]{1,}$/.test(password);
}
app.post('/enter', (req, res) => {
    const { playerId, username, password } = req.body;

    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(400).json({ error: 'Incorrect username or password' });
    }
    user.playerId = playerId;
    gameStates[playerId].isGuest = false;

    res.json({ success: true, username: username });
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
        isGuest: true
    };

    // preGame(playerId);
});

function makeStatistik(playerId){
    const user = users.find(user => user.playerId === playerId);
    if (user && !gameStates[playerId].isGuest) {
        user.score = gameStates[playerId].score;
        user.speed = gameStates[playerId].speed;
    }else {
        const newUser = {
            playerId: playerId,
            username: 'notRegisteredUser'+playerId,
            email: 'notRegisteredUser'+playerId,
            password: 'notRegisteredUser'+playerId,
            score: gameStates[playerId].score,
            speed: gameStates[playerId].speed
        };
        users.push(newUser);
    }
}




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
    makeStatistik(playerId);
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

