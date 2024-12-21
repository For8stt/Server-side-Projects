// client-side file
// Yulian Kisil id: 128371

const socket = new WebSocket('ws://localhost:8082'); // Підключення до WebSocket

socket.onopen = () => {
    console.log('Connected to the WebSocket server');
};


function createElementFromStructure(structure) {
    const element = document.createElement(structure.tag);

    if (structure.id) element.id = structure.id;
    if (structure.class) element.className = structure.class;
    if (structure.type) element.type = structure.type;
    if (structure.name) element.name = structure.name;
    if (structure.required) element.required = true;
    if (structure.placeholder) element.placeholder = structure.placeholder;
    if (structure.innerText) element.innerText = structure.innerText;
    if (structure.src) element.src = structure.src;
    if (structure.alt) element.alt = structure.alt;
    if (structure.width) element.width = structure.width;
    if (structure.height) element.height = structure.height;
    if (structure.value) element.value = structure.value;
    if (structure.accept) element.accept = structure.accept;
    // if (structure.style) element.style.cssText = structure.style;
    if (structure.style) {
        if (typeof structure.style === 'string') {
            element.style.cssText = structure.style;
        } else {
            for (let [key, value] of Object.entries(structure.style)) {
                element.style[key] = value;
            }
        }
    }

    if (structure.innerTags) {
        structure.innerTags.forEach(innerTag => {
            const child = createElementFromStructure(innerTag);
            element.appendChild(child);
        });
    }

    return element;
}


function renderPageStructure() {
    fetch('http://localhost:8080/page-structure')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(pageStructure => {
            // const rootElement = document.getElementById('root');
            const rootElement = document.body;
            const pageContent = createElementFromStructure(pageStructure);

            rootElement.appendChild(pageContent);

            addEventListeners();
            canvass();
        })
        .catch(error => {
            console.error('Error loading page structure:', error);
            alert(`An error occurred: ${error.message}`);
        });
}

function addEventListeners() {
    const form = document.getElementById('registrationForm');
    const nameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const pp = document.getElementById('pp');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const username = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;

        fetch('http://localhost:8080/registration', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({playerId, username: username, email: email, password: password})
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    pp.textContent = 'registered '
                } else {
                    pp.textContent = ` Registration error: ${data.error}`
                }
            });

        form.reset();
    });

    document.getElementById('loginButton').addEventListener('click', function (event) {
        event.preventDefault();

        const username = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;

        console.log(`Enter in the system. Meno: ${username}, Email: ${email}, Heslo: ${password}`);
        fetch('http://localhost:8080/enter', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({playerId, username: username, password: password})
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (data.role === 'admin') {
                        pp.textContent = `Welcome, Admin ${data.username}`;
                        document.getElementById('adminPanel').style.display = 'block';
                    } else {
                        pp.textContent = `Welcome, ${data.username}`;
                        document.getElementById('adminPanel').style.display = 'none';
                    }
                    if (data.shipImage) {
                        ShipUse = data.shipImage
                        console.log(ShipUse);
                    }
                } else {
                    pp.textContent = `Enter error: ${data.error}`
                }
            });

        form.reset();
    });


    document.getElementById('viewUsersButton').addEventListener('click', function () {
        showUsers()
    });


    deleteInfo = document.getElementById('deleteInfo')
    document.getElementById('deleteUserButton').addEventListener('click', function () {
        const userNameToDelete = document.getElementById('userIdToDelete').value;

        fetch(`http://localhost:8080/delete-user`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: userNameToDelete})
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    deleteInfo.textContent = `User ID ${userNameToDelete} has been deleted.`;
                    document.getElementById('userIdToDelete').value = '';
                } else {
                    deleteInfo.textContent = `Error deleting user: ${data.error}`;
                }
            })
            .catch(error => {
                console.error('Error deleting user:', error);
            });
    });
    const exportButton = document.getElementById('exportButton');
    exportButton.addEventListener('click', () => {
        fetch('http://localhost:8080/export-users', {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
            .then(response => {
                if (response.status === 204) {
                    throw new Error('No users to export.');
                }
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'users.csv';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Error exporting users:', error);
                alert(`Error exporting users: ${error.message}`);
            });
    });
    document.getElementById('importButton').addEventListener('click', (event) => {
        event.preventDefault();

        const fileInput = document.getElementById('userFileInput');
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);

        fetch('http://localhost:8080/import-users', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(message => {
                document.getElementById('deleteInfo').textContent = message;
            })
            .catch(error => {
                console.error('Error uploading CSV file:', error);
                document.getElementById('deleteInfo').textContent = 'Error uploading CSV file';
            });
    });
    const formm = document.getElementById('shipSelectionForm');
    const responseMessage = document.getElementById('responseMessage');

    formm.addEventListener('submit', function (event) {
        event.preventDefault();

        const selectedShipImage = formm.shipImage.value;

        fetch('http://localhost:8080/save-ship-selection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({playerId, shipImage: selectedShipImage})
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    responseMessage.textContent = data.message;
                    ShipUse = data.shipImage
                    console.log(ShipUse)
                } else {
                    responseMessage.textContent = `Error: ${data.error}`;
                }
            })
            .catch(error => {
                responseMessage.textContent = 'An error occurred while saving your selection.';
            });
    });

    const statusButton = document.getElementById('statusButton')
    statusButton.addEventListener('click', () => {

        fetch('http://localhost:8080/show-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({playerId})
        })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                const statusMessage = document.getElementById('statusMessage');
                statusMessage.innerHTML = '';
                if (data.success) {
                    if (data.users.length === 0) {
                        alert('No active users to watch them ');
                    } else {
                        statusMessage.innerHTML = data.users.map(user => {
                            return `<div>
                        Player ID: ${user.playerId} <br>
                        Username: ${user.username} <br>
                        Status: ${user.status} <br>
                    </div><hr>`;
                        }).join('');
                    }
                }

            })
            .catch(error => {
                responseMessage.textContent = 'An error occurred while saving your selection.';
            });
    });

    const observeButton = document.getElementById('observeButton');
    const targetPlayerIdInput = document.getElementById('targetPlayerId');

    observeButton.addEventListener('click', () => {
        const targetPlayerId = parseInt(targetPlayerIdInput.value);
        if (isNaN(targetPlayerId)) {
            alert('Enter a valid player ID');
            return;
        }

        fetch('http://localhost:8080/observe', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({playerId, targetPlayerId})
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log(`Subscription to a player with an ID  ${targetPlayerId} is successful`);
                } else {
                    alert(data.error);
                }
            }).catch(error => {
            alert('An error occurred: ' + error.message);
        });
    });
}


renderPageStructure();

    let playerId = null;
    let rShip = 0;
    let missiles = [];
    let lasers = []
    let gState = null;
    let observer = false

    function updateGstate(gameState) {
        rShip = gameState.ship.r;
        missiles = gameState.missiles;
        lasers = gameState.lasers
        gState = gameState;
    }

    socket.onmessage = (event) => {
        const gameState = JSON.parse(event.data);
        if (gameState.playerId !== undefined) {
            playerId = gameState.playerId;
            console.log(`Ваш ID: ${gameState.playerId}`);
        } else if (gameState.observer === true) {
            observer = true
            updateGstate(gameState.gameState);
            updateGameUI(gameState.gameState);
        } else if (!observer) {
            console.log(`Повідомлення від сервера:`)
            console.log(gameState)

            updateGstate(gameState);
            updateGameUI(gameState);
        }
    };
///======pressing the keys====///
    function sendAction(action, direction = null) {
        fetch('http://localhost:8080/action', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({playerId, action: {action, direction}})
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
///==========///

    function updateGameUI(gameState) {
        console.log('Оновлення UI гри:', gameState);
        initGameField();
        displayMissiles();
        displayLasers();
        displayShip();
        displayGameInfo();
    }



    function startGame() {
        if (imagesLoaded === totalImages) {
            initGameField();
            displayShip();

            fetch('http://localhost:8080/start-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({playerId: playerId})
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => {
                            throw new Error(err.error || 'Unable to start the game');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Game successfully started:', data);
                    displayAllUsersInfo(data.users);
                })
                .catch(error => {
                    alert(error.message);
                });
        }
    }

    function displayAllUsersInfo(users) {
        let infoElement = document.getElementById('game-info-for-all');

        if (!infoElement) {
            infoElement = document.createElement('p');
            infoElement.id = 'game-info-for-all';
            document.body.appendChild(infoElement);
        }else {
            infoElement.innerText='';
        }
        const userInfoString = users.map(user => `${user.username} score max: ${user.scoreMAX}   score for session: ${user.scoreSession}`).join('\n');
        infoElement.innerText = `Users: \n ${userInfoString}`;
    }


////=================================////
    var xFields = 59;
    var yFields = 59;

    var mid = {
        x: (xFields - 1) / 2,
        y: (yFields - 1) / 2
    };

// var gameDiv = document.getElementById('game');
function canvass() {
    var gameDiv = document.body
    gameDiv.appendChild(canvas);

    b = document.createElement('button');
    b.textContent = 'Start/restart Game';
    b.id = 'StartGame'
    document.body.appendChild(b)

    document.getElementById('StartGame').addEventListener('click', () => {
        startGame()
    })
}
    var canvas = document.createElement('canvas');
    canvas.width = xFields * 10;  // Set canvas width according to the field size
    canvas.height = yFields * 10;

    var ctx = canvas.getContext('2d');


    var laserImage = new Image();
    var ShipImage = new Image();
    var ShipImage2 = new Image();
    var MissileImage = new Image();
    var GunImage = new Image();

    let ShipUse = 'ship1'
    /*
    *link where I got it:  https://openclipart.org/detail/16287/tennis-ball-bola-de-tenis#google_vignette
    *license link: https://openclipart.org/share
    */
    laserImage.src = 'https://openclipart.org/image/400px/16287';
    /*
    *link where I got it:  https://openclipart.org/detail/261330
    * *link where I got it:  https://openclipart.org/detail/178310
    *license link: https://openclipart.org/share
    */
    ShipImage.src = 'https://openclipart.org/image/400px/261330';
    ShipImage2.src = 'https://openclipart.org/image/400px/178310'
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


    function displayPoint(x, y, color) {
        let shipToDisplay;
        if (ShipUse === 'ship1') {
            shipToDisplay = ShipImage;
        } else if (ShipUse === 'ship2') {
            shipToDisplay = ShipImage2;
        }

        if (color === 'green') {
            ctx.drawImage(MissileImage, x * 10, y * 10, 10, 10);
        } else if (color === 'black') {
            ctx.drawImage(shipToDisplay, x * 10, y * 10, 10, 10);
        } else if (color === 'red') {
            ctx.drawImage(GunImage, x * 10, y * 10, 10, 10);
        } else if (color === 'blue') {
            ctx.drawImage(laserImage, x * 10, y * 10, 10, 10);
        } else {
            ctx.fillStyle = 'cyan';
            ctx.fillRect(x * 10, y * 10, 10, 10);
        }
    }

    let imagesLoaded = 0;
    const totalImages = 5;


    function checkImagesLoaded() {
        imagesLoaded++;
        // if (imagesLoaded === totalImages) {
        //     initGameField();
        //     displayShip();
        // }
    }


    laserImage.onload = checkImagesLoaded;
    ShipImage.onload = checkImagesLoaded;
    ShipImage2.onload = checkImagesLoaded;
    MissileImage.onload = checkImagesLoaded;
    GunImage.onload = checkImagesLoaded;


///+++=========+++///

    var xShip = mid.x;
    var yShip = mid.y;

    var shipCenter = [
        [xShip - 1, yShip - 1], [xShip, yShip - 1], [xShip + 1, yShip - 1],
        [xShip - 1, yShip], [xShip, yShip], [xShip + 1, yShip],
        [xShip - 1, yShip + 1], [xShip, yShip + 1], [xShip + 1, yShip + 1]
    ];

// north: south: west: east: nw: ne: sw: se:
//  X             X     X    X X X X X     X
// XXX    XXX    XX     XX    X   X   X   X
//         X      X     X    X     X X X X X
    var shipRotations = [
        {points: [3, 4, 5], rpg: 1}, // 0 north
        {points: [0, 4, 8], rpg: 2}, // 1 north-east
        {points: [1, 4, 7], rpg: 5}, // 2 east
        {points: [2, 4, 6], rpg: 8}, // 3 south-east
        {points: [3, 4, 5], rpg: 7}, // 4 south
        {points: [0, 4, 8], rpg: 6}, // 5 south-west
        {points: [1, 4, 7], rpg: 3}, // 6 west
        {points: [2, 4, 6], rpg: 0}, // 7 north-west
    ];


    function displayShip() {
        shipRotations[rShip].points.forEach(point => {
            var tmpX = shipCenter[point][0];
            var tmpY = shipCenter[point][1];
            displayPoint(tmpX, tmpY, 'black');
        });
        var point = shipRotations[rShip].rpg;
        var tmpX = shipCenter[point][0];
        var tmpY = shipCenter[point][1];
        displayPoint(tmpX, tmpY, 'red');
    }

    function displayLasers() {
        lasers.forEach(laser => {
            displayPoint(laser.x, laser.y, 'blue');
        });
    }

    function displayMissiles() {
        missiles.forEach(missile => {
            displayPoint(missile.x, missile.y, 'green');
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

        infoElement.textContent = `MY: Score: ${gState.score} | Speed: ${gState.speed}ms`;
    }

function showUsers() {
    fetch('http://localhost:8080/users', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
        .then(response => response.json())
        .then(users => {
            const userList = document.getElementById('userList');
            userList.innerHTML = '';
            if (users.length === 0) {
                alert('no users');
                return;
            }
            users.forEach(user => {
                const userItem = document.createElement('p');
                userItem.textContent = `Username: ${user.username}`;
                userList.appendChild(userItem);
            });
            // showUsers();
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
}