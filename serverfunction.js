function rotateShip(rShip,rotation) {
    if(rotation > 0) rShip = (rShip+1)%8;
    else if(rotation < 0) {
        if(rShip===0) rShip = 7;
        else rShip = rShip - 1;
    }
    return rShip
}
module.exports = { rotateShip };