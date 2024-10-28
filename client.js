// client.js
// Yulian Kisil id: 128371

const socket = new WebSocket('ws://localhost:8082'); // Підключення до WebSocket

socket.onopen = () => {
    console.log('Підключено до WebSocket сервера');
};
let playerId = null;
let rShip = 0;
let missiles = [];
let lasers = []
let gState=null;

function updateGstate(gameState){
    rShip=gameState.ship.r;
    missiles=gameState.missiles;
    lasers=gameState.lasers
    gState=gameState;
}

socket.onmessage = (event) => {
    const gameState = JSON.parse(event.data);
    if (gameState.playerId !== undefined) {
        // Якщо отримали ID від сервера
        playerId = gameState.playerId;
        console.log(`Ваш ID: ${gameState.playerId}`);
        // Можна зберегти ID в змінній для подальшого використання
    } else {
        console.log(`Повідомлення від сервера:`)
        console.log(gameState)

        updateGstate(gameState);
        updateGameUI(gameState);
    }
};

function sendAction(action, direction = null) {
    fetch('http://localhost:8080/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, action: { action, direction } })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Дія надіслана успішно');
            } else {
                console.error('Помилка відправки дії:', data.error);
            }
        });
}
window.addEventListener('keydown', (ev) => {
    if (ev.code === 'KeyJ' || ev.code === 'ArrowLeft') {
        sendAction('rotateShip', -1);
    } else if (ev.code === 'KeyL' || ev.code === 'ArrowRight') {
        sendAction('rotateShip', 1);
    } else if (ev.code === 'Space') {
        sendAction('addLaser');
    }
});

// Логіка для оновлення інтерфейсу гри
function updateGameUI(gameState) {
    // Оновлення елементів на сторінці відповідно до стану гри
    console.log('Оновлення UI гри:', gameState);
    initGameField();
    displayMissiles();
    displayLasers();
    displayShip();
    displayGameInfo();
}










////=================================////
var xFields = 59;
var yFields = 59;
var fields = 59;

var mid = {
    x: (xFields-1)/2,
    y: (yFields-1)/2
};

var gameDiv = document.getElementById('game');

var canvas = document.createElement('canvas');
canvas.width = xFields*10;  // Set canvas width according to the field size
canvas.height = yFields*10;
gameDiv.appendChild(canvas);

var ctx = canvas.getContext('2d');


var laserImage = new Image();
var ShipImage = new Image();
var MissileImage = new Image();
var GunImage = new Image();

/*
*link where I got it:  https://openclipart.org/detail/16287/tennis-ball-bola-de-tenis#google_vignette
*license link: https://openclipart.org/share
*/
laserImage.src = 'https://openclipart.org/image/400px/16287';
/*
*link where I got it:  https://openclipart.org/detail/261330
*license link: https://openclipart.org/share
*/
ShipImage.src = 'https://openclipart.org/image/400px/261330';
/*
*link where I got it:  https://openclipart.org/detail/183238/8-ball
*license link: https://openclipart.org/share
*/
MissileImage.src = 'https://openclipart.org/image/400px/183238';/*
*link where I got it: https://openclipart.org/detail/297696
*license link: https://openclipart.org/share
*/
GunImage.src = 'https://openclipart.org/image/400px/297696';

function initGameField() {
    ctx.fillStyle = 'cyan';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}



function displayPoint(x,y,color) {
    if (color==='green'){
        ctx.drawImage(MissileImage, x * 10, y * 10, 10, 10);
    }else if(color==='black'){
        ctx.drawImage(ShipImage, x * 10, y * 10, 10, 10);
    } else if(color==='red'){
        ctx.drawImage(GunImage, x * 10, y * 10, 10, 10);
    }else if(color==='blue'){
        ctx.drawImage(laserImage, x * 10, y * 10, 10, 10);
    } else {
        ctx.fillStyle = 'cyan';
        ctx.fillRect(x * 10, y * 10, 10, 10);
    }
}
let imagesLoaded = 0;
const totalImages = 4;


function checkImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        initGameField();
        displayShip();
    }
}


laserImage.onload = checkImagesLoaded;
ShipImage.onload = checkImagesLoaded;
MissileImage.onload = checkImagesLoaded;
GunImage.onload = checkImagesLoaded;


///+++=========+++///

var xShip = mid.x;
var yShip = mid.y;

var shipCenter = [
    [xShip-1,yShip-1],[xShip,yShip-1],[xShip+1,yShip-1],
    [xShip-1,yShip],[xShip,yShip],[xShip+1,yShip],
    [xShip-1,yShip+1],[xShip,yShip+1],[xShip+1,yShip+1]
];

// north: south: west: east: nw: ne: sw: se:
//  X             X     X    X X X X X     X
// XXX    XXX    XX     XX    X   X   X   X
//         X      X     X    X     X X X X X
var shipRotations = [
    {points: [3,4,5], rpg: 1}, // 0 north
    {points: [0,4,8], rpg: 2}, // 1 north-east
    {points: [1,4,7], rpg: 5}, // 2 east
    {points: [2,4,6], rpg: 8}, // 3 south-east
    {points: [3,4,5], rpg: 7}, // 4 south
    {points: [0,4,8], rpg: 6}, // 5 south-west
    {points: [1,4,7], rpg: 3}, // 6 west
    {points: [2,4,6], rpg: 0}, // 7 north-west
];


function displayShip() {
    shipRotations[rShip].points.forEach(point => {
        var tmpX = shipCenter[point][0];
        var tmpY = shipCenter[point][1];
        displayPoint(tmpX,tmpY,'black');
    });
    var point = shipRotations[rShip].rpg;
    var tmpX = shipCenter[point][0];
    var tmpY = shipCenter[point][1];
    displayPoint(tmpX,tmpY,'red');
}

function displayLasers() {
    lasers.forEach(laser => {
        displayPoint(laser.x, laser.y, 'blue');
    });
}

function displayMissiles() {
    missiles.forEach(missile => {
        displayPoint(missile.x,missile.y,'green');
    });
}

//==Show information about game===//
function displayGameInfo() {
    let infoElement = document.getElementById('game-info');

    if (!infoElement) {
        infoElement = document.createElement('p');
        infoElement.id = 'game-info';
        document.body.appendChild(infoElement);
    }

    infoElement.textContent = `Score: ${gState.score} | Speed: ${gState.speed}ms`;
}
