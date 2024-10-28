module.exports = {
    rotateShip,
    addLaser,
    moveLasers,
    moveMissiles,
    addMissile

};
const server =require('./server');



var xFields = 59;
var yFields = 59;
var fields = 59;

var mid = {
    x: (xFields-1)/2,
    y: (yFields-1)/2
};

function rotateShip(rShip,rotation) {
    if(rotation > 0) rShip = (rShip+1)%8;
    else if(rotation < 0) {
        if(rShip===0) rShip = 7;
        else rShip = rShip - 1;
    }
    return rShip
}
// let lasers = []
function addLaser(rShip) {
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

    return retObj;
}

function random(min,max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// var missiles = [];
function addMissile(playerId,gameStates) {
    var rand = random(0,7);
    // 7 0 1
    // 6   2
    // 5 4 3
    if(rand === 0) gameStates[playerId].missiles.push({x: mid.x, y: 0});
    else if(rand === 1) gameStates[playerId].missiles.push({x: xFields-1, y: 0});
    else if(rand === 2) gameStates[playerId].missiles.push({x: xFields-1, y: mid.y});
    else if(rand === 3) gameStates[playerId].missiles.push({x: xFields-1, y: yFields-1});
    else if(rand === 4) gameStates[playerId].missiles.push({x: mid.x, y: yFields-1});
    else if(rand === 5) gameStates[playerId].missiles.push({x: 0, y: yFields-1});
    else if(rand === 6) gameStates[playerId].missiles.push({x: 0, y: mid.y});
    else if(rand === 7) gameStates[playerId].missiles.push({x: 0, y: 0});
    return gameStates[playerId].missiles;
}

function moveMissiles(playerId,gameStates) {

    // calculate new possitions
    gameStates[playerId].missiles = gameStates[playerId].missiles.map(missile => {
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

    if(collision(playerId,gameStates)){

        server.endGame(playerId);
    }

    return gameStates[playerId].missiles
}
function collision(playerId,gameStates) {
    for(var i=0;i<gameStates[playerId].missiles.length;i++){
        var missile = gameStates[playerId].missiles[i];
        if(missile.x === mid.x+1 || missile.x === mid.x-1 || missile.y === mid.y+1 || missile.y === mid.y-1) {
            return true;
        }
    }
    return false;
}

function moveLasers(playerId,gameStates) {

    // move lasers
    gameStates[playerId].lasers = gameStates[playerId].lasers.map(laser => {
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

    gameStates[playerId].lasers = gameStates[playerId].lasers.filter(laser => {
        if(laser.x < 0) return false;
        else if(laser.x > fields-1) return false;
        else if(laser.y < 0) return false;
        else if(laser.y > fields-1) return false;

        let laserXMissile = false;
        let removes = [];
        for(var i=0;i<gameStates[playerId].missiles.length;i++) {
            var missile = gameStates[playerId].missiles[i];
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

            removes.forEach(remove => {
                gameStates[playerId].missiles.splice(remove,1);
            });

        }

        return !laserXMissile;
    });

    return gameStates[playerId];
}













//===========================================================================================//
//===========================================================================================//
//===========================================================================================//
//===========================================================================================//
/*

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




*/
