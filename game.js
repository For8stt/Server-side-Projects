var xFields = 59;
var yFields = 59;
var fields = 59;

var mid = {
    x: (xFields-1)/2,
    y: (yFields-1)/2
};
// //===J and L===//
// window.addEventListener('keydown',(ev)=>{
//     if(ev.code === 'KeyJ' || ev.code === 'ArrowLeft') rotateShip(-1);
//     else if(ev.code === 'KeyL' || ev.code === 'ArrowRight') rotateShip(1);
//     else if(ev.code === 'Space' || ev.code === 'Space') {
//         addLaser();
//     }
// })


// //======//

///+++=====Canvas====+++///
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
var rShip = 0;
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

function deletePoint(x,y) {
    displayPoint(x,y,'white');
}

function deleteShip() {
    var pointsToBeDeleted = shipRotations[rShip].points.concat([shipRotations[rShip].rpg]);
    pointsToBeDeleted.forEach(point => {
        var tmpX = shipCenter[point][0];
        var tmpY = shipCenter[point][1];
        deletePoint(tmpX,tmpY);
    });
}

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

function rotateShip(rotation) {
    // delete old ship points
    deleteShip();

    // calculate new ship points
    if(rotation > 0) rShip = (rShip+1)%8;
    else if(rotation < 0) {
        if(rShip===0) rShip = 7;
        else rShip = rShip - 1;
    }

    // render new ship
    displayShip();
}

function random(min,max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

var missiles = [];
function addMissile() {
    var rand = random(0,7);
    // 7 0 1
    // 6   2
    // 5 4 3
    if(rand === 0) missiles.push({x: mid.x, y: 0});
    else if(rand === 1) missiles.push({x: xFields-1, y: 0});
    else if(rand === 2) missiles.push({x: xFields-1, y: mid.y});
    else if(rand === 3) missiles.push({x: xFields-1, y: yFields-1});
    else if(rand === 4) missiles.push({x: mid.x, y: yFields-1});
    else if(rand === 5) missiles.push({x: 0, y: yFields-1});
    else if(rand === 6) missiles.push({x: 0, y: mid.y});
    else if(rand === 7) missiles.push({x: 0, y: 0});
}

function deleteMissiles() {
    missiles.forEach(missile => {
        deletePoint(missile.x, missile.y);
    });
}

function displayMissiles() {
    missiles.forEach(missile => {
        displayPoint(missile.x,missile.y,'green');
    });
}

function moveMissiles() {
    // delete old missile points
    deleteMissiles();

    // calculate new possitions
    missiles = missiles.map(missile => {
        var m = (missile.y - mid.y) / (missile.x - mid.x);
        var b = missile.y - (m * missile.x);

        if(missile.x === mid.x) {
            if(missile.y > mid.y) return {x: missile.x, y: missile.y-1};
            else return {x: missile.x, y: missile.y+1};
        }
        else if(missile.y === mid.y) {
            if(missile.x < mid.x) return {x: missile.x+1, y: missile.y};
            else return {x: missile.x-1, y: missile.y};
        }
        else {
            let retX = missile.x;
            let retY = missile.y;
            if(missile.y < mid.y) retY++;
            else retY--;
            if(missile.x < mid.x) retX++;
            else retX--;
            return {x: retX, y: retY};
        }
    });

    if(collision()){
        endGame();
    }


    // displayMissiles
    displayMissiles();
}

displayShip();

function collision() {
    for(var i=0;i<missiles.length;i++){
        var missile = missiles[i];
        if(missile.x === mid.x+1 || missile.x === mid.x-1 || missile.y === mid.y+1 || missile.y === mid.y-1) {
            return true;
        }
    }
    return false;
}

let lasers = []
function addLaser() {
    // 7 0 1
    // 6   2
    // 5 4 3
    let retObj = {x: mid.x, y: mid.y, r: rShip};

    if(rShip === 0)      { retObj.y = mid.y-2; }
    else if(rShip === 1) { retObj.x = mid.x+2; retObj.y = mid.y-2; }
    else if(rShip === 2) { retObj.x = mid.x+2; }
    else if(rShip === 3) { retObj.x = mid.x+2; retObj.y = mid.y+2; }
    else if(rShip === 4) { retObj.y = mid.y+2; }
    else if(rShip === 5) { retObj.x = mid.x-2; retObj.y = mid.y+2; }
    else if(rShip === 6) { retObj.x = mid.x-2; }
    else if(rShip === 7) { retObj.x = mid.x-2; retObj.y = mid.y-2; }

    lasers.push(retObj);
}

function displayLasers() {
    lasers.forEach(laser => {
        displayPoint(laser.x, laser.y, 'blue');
    });
}

function moveLasers() {
    // delete old lasers
    lasers.forEach(laser => {
        displayPoint(laser.x,laser.y,'white');
    });

    // move lasers
    lasers = lasers.map(laser => {
        if(laser.r === 0)      { laser.y--; }
        else if(laser.r === 1) { laser.x++; laser.y--; }
        else if(laser.r === 2) { laser.x++; }
        else if(laser.r === 3) { laser.x++; laser.y++; }
        else if(laser.r === 4) { laser.y++; }
        else if(laser.r === 5) { laser.x--; laser.y++; }
        else if(laser.r === 6) { laser.x--; }
        else if(laser.r === 7) { laser.x--; laser.y--; }
        return laser;
    });

    lasers = lasers.filter(laser => {
        if(laser.x < 0) return false;
        else if(laser.x > fields-1) return false;
        else if(laser.y < 0) return false;
        else if(laser.y > fields-1) return false;

        let laserXMissile = false;
        let removes = [];
        for(var i=0;i<missiles.length;i++) {
            var missile = missiles[i];
            if(
                (missile.x === laser.x || missile.x === (laser.x + 1) || missile.x === (laser.x - 1)) &&
                (missile.y === laser.y || missile.y === (laser.y + 1) || missile.y === (laser.y - 1))
            ) {
                laserXMissile = true;
                removes.push(i);
                break;
            }
        }

        if(removes.length > 0) {
            deleteMissiles();
            removes.forEach(remove => {
                missiles.splice(remove,1);
            });
            displayMissiles();
        }

        return !laserXMissile;
    });

    displayLasers();
}

var counter = 0;
var ival = null;
var speed = 1000;
var score = 0;
var incrementScore = (hm) => {
    score = score + hm;
};

var startGame = () => {
    score = 0;
    mainLoop();
};

window.addEventListener('start',startGame);
let preGame = () => {
    var countdown = 5;
    for(var i=0;i<countdown;i++) {
        ((i)=>{
            setTimeout(()=>{
//                 console.log(countdown-i);
            },i*1000);
        })(i);
    }
    setTimeout(()=>{
        startGame();
    },(countdown+1)*1000);
};
preGame();

var endGame = function() {
    clearInterval(ival);
}



//===Reset===//
const resetButton=document.createElement('button')
resetButton.textContent='Reset'
document.body.appendChild(resetButton)

resetButton.addEventListener('click', resetGame);

function deleteLasers() {
    lasers.forEach(missile => {
        deletePoint(missile.x, missile.y);
    });
}

function resetGame() {
    clearInterval(ival);
    score = 0;
    speed = 1000;
    counter = 0;
    deleteLasers();
    deleteMissiles();
    missiles = [];
    lasers = [];
    startGame();
    displayShip();
}
//=====//


//+===Debug===+//
const debugButton = document.createElement('button');
debugButton.textContent = 'Debug off';
document.body.appendChild(debugButton);

debugButton.addEventListener('click', toggleDebug);

infoElement = document.createElement('p');
infoElement.id = 'debugArea';
document.body.appendChild(infoElement);

var debugMod=false;
var inter=null;
function toggleDebug() {
    debugMod=!debugMod

    if (debugMod) {
        debugButton.textContent = 'Debug on';
        inter=setInterval(()=>{
            updateDebugInfo();
        },speed)
    }else {
        debugButton.textContent = 'Debug off';
        clearInterval(inter);
        document.getElementById('debugArea').textContent = '';
    }

}
function updateDebugInfo() {
    const debugArea = document.getElementById('debugArea');
    let debugInfo = `Debug mode:`;
    debugInfo += 'Active Lasers: ';
    debugInfo += `Count: ${lasers.length} `;
    lasers.forEach((laser, index) => {
        debugInfo += `[ ${laser.x}, ${laser.y}] `;
    });
    debugInfo += '|| Active Missiles: ';
    debugInfo += `Count: ${missiles.length} `;
    missiles.forEach((missile, index) => {
        debugInfo += `[${missile.x}, ${missile.y}] `;
    });

    debugArea.textContent = debugInfo;
}
//=========//



//==Show information about game===//
function displayGameInfo() {
    let infoElement = document.getElementById('game-info');

    if (!infoElement) {
        infoElement = document.createElement('p');
        infoElement.id = 'game-info';
        document.body.appendChild(infoElement);
    }

    infoElement.textContent = `Score: ${score} | Speed: ${speed}ms`;
}

function mainLoop() {
    ival = setInterval(() => {
        moveMissiles();
        moveLasers();
        counter++;
        incrementScore(10);

        displayGameInfo();

        if (counter % 5 === 0) addMissile();
        if (counter % 20 === 0) {
            clearInterval(ival);
            speed = Math.round(speed / 2);
            mainLoop();
        }
    }, speed);
}
//=====//

//====Music===//
const backgroundMusic = document.createElement('audio');
/*
*link where I got it:  https://pixabay.com/music/beats-lazy-day-stylish-futuristic-chill-239287/
*license link: https://pixabay.com/service/license-summary/
*/
backgroundMusic.src='https://cdn.pixabay.com/audio/2024/09/09/audio_7556bb3a41.mp3'
document.body.appendChild(backgroundMusic);
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

const playMusicButton = document.createElement('button');
playMusicButton.textContent = 'Play Music';
document.body.appendChild(playMusicButton);

playMusicButton.addEventListener('click', () => {
    playMusic();
});

var musicOnOff=false
function playMusic(){
    musicOnOff=!musicOnOff;
    if (musicOnOff){
        playMusicButton.textContent = 'Stop Music';
        backgroundMusic.play();
    }else {
        playMusicButton.textContent = 'Play Music'
        backgroundMusic.pause();
    }
}

