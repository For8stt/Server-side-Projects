// server file
// Yulian Kisil
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






const pageStructure = {
    tag: "div",
    id: "cont",
    class: "container",
    innerTags: [
        {
            tag: "div",
            class: "row",
            innerTags: [
                {
                    tag: "h1",
                    innerText: "U2"
                }
            ]
        },
        {
            tag: "div",
            class: "row",
            innerTags: [
                {
                    tag: "div",
                    id: "game",
                    innerText: ""
                }
            ]
        },
        {
            tag: "form",
            id: "registrationForm",
            innerTags: [
                {
                    tag: "table",
                    innerTags: [
                        {
                            tag: "tr",
                            innerTags: [
                                { tag: "td", innerText: "User name:" },
                                { tag: "td", innerTags: [{ tag: "input", type: "text", id: "username", name: "username", required: true }] }
                            ]
                        },
                        {
                            tag: "tr",
                            innerTags: [
                                { tag: "td", innerText: "Email:" },
                                { tag: "td", innerTags: [{ tag: "input", type: "email", id: "email", name: "email" }] }
                            ]
                        },
                        {
                            tag: "tr",
                            innerTags: [
                                { tag: "td", innerText: "Password:" },
                                { tag: "td", innerTags: [{ tag: "input", type: "password", id: "password", name: "password", required: true }] }
                            ]
                        },
                        {
                            tag: "tr",
                            innerTags: [
                                {
                                    tag: "td",
                                    colspan: 1,
                                    style: "text-align: center;",
                                    innerTags: [
                                        { tag: "button", type: "submit", innerText: "Register" },
                                        { tag: "button", type: "button", id: "loginButton", innerText: "Log in" }
                                    ]
                                }
                            ]
                        },
                        {
                            tag: "tr",
                            innerTags: [
                                {
                                    tag: "td",
                                    colspan: 2,
                                    style: "text-align: center;",
                                    innerTags: [
                                        { tag: "p", id: "pp", innerText: "" }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            tag: "div",
            id: "adminPanel",
            style: "display: none;",
            innerTags: [
                { tag: "button", id: "viewUsersButton", innerText: "View Users" },
                { tag: "div", id: "userList", innerText: "" },
                { tag: "input", type: "text", id: "userIdToDelete", placeholder: "Enter Username to delete" },
                { tag: "button", id: "deleteUserButton", innerText: "Delete User" },
                { tag: "input", type: "file", id: "userFileInput",accept:".csv" },
                { tag: "p", id: "deleteInfo", innerText: "" },
                { tag: "button", id: "importButton", innerText: "import csv" },
                { tag: "button", id: "exportButton", innerText: "export csv" },

            ]
        },
        {
            tag: "form",
            id: "shipSelectionForm",
            innerTags: [
                { tag: "h2", innerText: "Select an image of the ship:" },
                {
                    tag: "div",
                    innerTags: [
                        {
                            tag: "label",
                            innerTags: [
                                { tag: "input", type: "radio", name: "shipImage", value: "ship1", required: true },
                                { tag: "img", src: "https://openclipart.org/image/400px/261330", alt: "Ship 1", width: 100, height: 100 }
                            ]
                        },
                        {
                            tag: "label",
                            innerTags: [
                                { tag: "input", type: "radio", name: "shipImage", value: "ship2" },
                                { tag: "img", src: "https://openclipart.org/image/400px/178310", alt: "Ship 2", width: 100, height: 100 }
                            ]
                        }
                    ]
                },
                { tag: "button", type: "submit", innerText: "Save your selection" }
            ]
        },
        { tag: "p", id: "responseMessage", innerText: "" },
        { tag: "button", id: "statusButton", innerText: "Show active players" },
        { tag: "div", id: "statusMessage", innerText: "" },
        {
            tag: "h2",
            innerText: "Observation of the player"
        },
        { tag: "input", type: "number", id: "targetPlayerId", placeholder: "ID of the player to be monitored" },
        { tag: "button", id: "observeButton", innerText: "Follow a player" },
    ]
};


module.exports = {
    rotateShip,
    addLaser,
    moveLasers,
    moveMissiles,
    addMissile,
    pageStructure
};



//===========================================================================================//
//===========================================================================================//
//===========================================================================================//
//===========================================================================================//