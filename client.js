// client.js
// Yulian Kisil id: 128371

const socket = new WebSocket('ws://localhost:8082'); // Підключення до WebSocket

socket.onopen = (event) => {
    console.log('loxxx',event)
    console.log('Підключено до WebSocket сервера');
};

socket.onmessage = (event) => {
    const gameState = JSON.parse(event.data);
    if (gameState.playerId !== undefined) {
        // Якщо отримали ID від сервера
        console.log(`Ваш ID: ${gameState.playerId}`);
        // Можна зберегти ID в змінній для подальшого використання
        const playerId = gameState.playerId;
    } else {
        console.log(`Повідомлення від сервера:`+gameState)
    }

};

window.addEventListener('keydown', (ev) => {
    if (ev.code === 'KeyJ' || ev.code === 'ArrowLeft') {
        socket.send(JSON.stringify({ action: 'rotateShip', direction: -1 }));
    } else if (ev.code === 'KeyL' || ev.code === 'ArrowRight') {
        socket.send(JSON.stringify({ action: 'rotateShip', direction: 1 }));
    } else if (ev.code === 'Space') {
        socket.send(JSON.stringify({ action: 'addLaser' }));
    }
});

// Логіка для оновлення інтерфейсу гри
function updateGameUI(gameState) {
    // Оновлення елементів на сторінці відповідно до стану гри
    console.log('Оновлення UI гри:', gameState);
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

function displayShip(){
    console.log('ship')
}