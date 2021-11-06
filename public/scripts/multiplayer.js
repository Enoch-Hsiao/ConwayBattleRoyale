import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.3.0/firebase-app.js'
import { getDatabase, ref, set, push, child, get, onValue } from "https://www.gstatic.com/firebasejs/9.3.0/firebase-database.js";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAODKoKrUY4-8QWpN_jnunw5So9LvG3ERM",
  authDomain: "conways-game-of-death.firebaseapp.com",
  databaseURL: "https://conways-game-of-death-default-rtdb.firebaseio.com",
  projectId: "conways-game-of-death",
  storageBucket: "conways-game-of-death.appspot.com",
  messagingSenderId: "493535520033",
  appId: "1:493535520033:web:fb20cbcc9f5bfdf3b88a60"
};

const app = initializeApp(firebaseConfig);

let database = getDatabase(app);
// assume user is host
let gameData = {
    maxNumPixels: 15,
    iterations: 500,
    boardSize: 30,
    timePerGeneration: 50,
    gameState: 'configuration'
  };

let keyValueForGame = push(ref(database, 'gameSessions'), {
    maxNumPixels: 15,
    iterations: 500,
    boardSize: 30,
    timePerGeneration: 50,
    gameState: 'configuration'
  }).key;

let host = true
let player2Present = false
document.getElementById("game-PIN-value").innerHTML = 'Game PIN:' + keyValueForGame

const db = getDatabase()
const dbRef = ref(getDatabase());

let gameSessionRef = ref(db, `gameSessions/${keyValueForGame}`);
function gameDataChange(host) {
  onValue(gameSessionRef, (snapshot) => {
    gameData = snapshot.val();
    console.log(gameData);
    if (gameData.player2Present && gameData.gameState == "configuration") {
      player2Present = true;
      document.getElementById("join-game").style.display = "none";
      if(host) {
        document.getElementById("game-state").innerHTML = "Please enter your configuration for the game as the host.";
        document.getElementById("player2-parameters").style.display = "none";
        document.getElementById("submit").style.display = 'block';
      } else {
        document.getElementById("game-state").innerHTML = "Please wait for the host to configure the game";
        document.getElementById("form-game-parameters").style.display = "none";
        document.getElementById("player2-parameters").style.display = "block";
        document.getElementById("submit").style.display = "none";
      }
    } else if (gameData.player2Present && gameData.gameState == "preparation") {
      document.getElementById("game-state").innerHTML = "Please prepare your blocks.";
      document.getElementById("game-buttons").style.display = 'block';
      document.getElementById("submit-button").style.display = 'block';
      if(host) {
        document.getElementById("submit").style.display = "none";
        document.getElementById("maxPixelNum").disabled = true;
        document.getElementById("numGenerations").disabled = true;
        document.getElementById("numBoxes").disabled = true;
        document.getElementById("timePerGen").disabled = true;

      } else {
        document.getElementById("max-pixel-num").innerHTML = `Number of Pixels: ${gameData.maxNumPixels}`;
        document.getElementById("number-of-iterations").innerHTML = `Number of Iterations: ${gameData.iterations}`;
        document.getElementById("number-of-board-size").innerHTML = `Board Size: ${gameData.boardSize}`;
        document.getElementById("time-per-generation").innerHTML = `Time Per Generation (ms): ${gameData.timePerGeneration}`;
        MAX_GEN_NUM = gameData.iterations;
        NUM_BOXES = gameData.boardSize;
        boxWidth = gameCanvas.width / NUM_BOXES;
        boxHeight = boxWidth;
        MAX_BOX_COUNT = gameData.maxNumPixels;
        TIME_PER_GENERATION = gameData.timePerGeneration;
      }
      initializeGame();
    }
  });
}

function checkPIN() {
  let PIN = document.getElementById('game-PIN').value;
  if (PIN.trim() === '') {
    document.getElementById("not-valid").innerHTML = 'PIN is blank!';
    return;
  }
  if (PIN === keyValueForGame) {
    document.getElementById("not-valid").innerHTML = 'You cannot join your own game!';
    return;
  }
  get(child(dbRef, `gameSessions/${PIN}`)).then((snapshot) => {
    let data = snapshot.val();
    if (!snapshot.exists()) {
      document.getElementById("not-valid").innerHTML = 'No game found for game PIN!';
      return;
    } 
    if (data.player2Present) {
      document.getElementById("not-valid").innerHTML = 'Game is already full!';
      return;
    } 
    keyValueForGame = PIN;
    document.getElementById("game-PIN-value").innerHTML = 'Game PIN:' + PIN;
    document.getElementById("join-game").style.display = "none";
    document.getElementById("star-player-1").style.display = "none";
    document.getElementById("star-player-2").style.display = "inline-block";
    data['player2Present'] = true;
    set(ref(database, `gameSessions/${PIN}`), data);
    gameSessionRef = ref(db, `gameSessions/${PIN}`);
    gameData = data;
    host = false;
    gameDataChange(host);
  })
}

document.getElementById('Enter Game').addEventListener('click', checkPIN);

initialConfig();

function initialConfig() {
  let fillerButton = document.getElementById("filler-button");
  fillerButton.disabled = true;
  fillerButton.style.background = '#202020';
  fillerButton.style.color = 'white';
  document.getElementById("submit").style.display = 'none';
  document.getElementById("game-buttons").style.display = 'none';
  document.getElementById("submit-button").style.display = 'none';
  document.getElementById("game-state").innerHTML = "Waiting for player 2.";
  gameDataChange(true);
}
let helpModal = document.getElementById("help-modal");
let helpButton = document.getElementById("help-button");
let closeButtonHelpButton = document.getElementsByClassName("close-button-help-model")[0];

helpButton.onclick = function() {
  helpModal.style.display = "flex";
}
closeButtonHelpButton .onclick = function() {
  helpModal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target === helpModal) {
    helpModal.style.display = "none";
  }
}
document.getElementById('submit').addEventListener('click', setParams);

let MAX_GEN_NUM = null;
let NUM_BOXES = 30;
let MAX_BOX_COUNT = null;
let TIME_PER_GENERATION = null;
let CAN_EDIT = false;

const gameCanvas = document.getElementById("game-canvas");
const gameCtx = gameCanvas.getContext('2d');
const gameContainerHeight = Math.floor(document.getElementById("game-container").getBoundingClientRect().height);
gameCtx.imageSmoothingEnabled = false;
gameCanvas.width = gameContainerHeight;
gameCanvas.height = gameContainerHeight;

let boxWidth = gameCanvas.width / NUM_BOXES;
let boxHeight = boxWidth;

let clicked = false;
let numBoxesUsed = 0;
let toolSelected = 'filler';

function initializeGame() {

  makeGrid();
  gameCanvas.addEventListener('mousedown', function(e) {
    clicked = true;
    if (CAN_EDIT) { handleBoxClick(e); }
  });
  gameCanvas.addEventListener('mouseup', function(e) {
    clicked = false;
  });
  gameCanvas.addEventListener('mousemove', function(e) {
    if (clicked && CAN_EDIT) { handleBoxClick(e); }
  });
  document.getElementById('filler-button').addEventListener('click', function() {
    switchTool('f');
  })
  document.getElementById('eraser-button').addEventListener('click', function() {
    switchTool('e');
  })
  CAN_EDIT = true;
  
}

function setParams() {
  console.log('hi')
  let ng = document.getElementById("numGenerations").value;
  let nb = document.getElementById("numBoxes").value;
  let mbc = document.getElementById("maxPixelNum").value;
  let tpg = document.getElementById("timePerGen").value;
  if ( ng < 50 || ng > 500) {
    alert("Please set the number of generations to something between 50 and 500");
    return false;
  } else if(nb < 10 || nb > 50 || nb % 2 !== 0) {
    alert("Please set the board size to an even number between 10 and 50");
    return false;
  } else if(tpg < 25 || tpg > 1000) {
    alert("Please set the time per generation to something between 25 and 1000 ms");
    return false;
  } else {
    document.getElementById("numGenerations").disabled = true;
    document.getElementById("numBoxes").disabled = true;
    document.getElementById("maxPixelNum").disabled = true;
    document.getElementById("timePerGen").disabled = true;
    MAX_GEN_NUM = ng;
    NUM_BOXES = nb;
    boxWidth = gameCanvas.width / NUM_BOXES;
    boxHeight = boxWidth;
    MAX_BOX_COUNT = mbc;
    TIME_PER_GENERATION = tpg;

    set(ref(database, 'gameSessions/' + keyValueForGame), {
      maxNumPixels: mbc,
      iterations: ng,
      boardSize: nb,
      timePerGeneration: tpg,
      gameState: 'preparation',
      player2Present: true
    });
    CAN_EDIT = true;
    return true;
  }
}

function makeGrid() {
  gameCtx.lineWidth = 1;
  gameCtx.beginPath();
  for (let row = 0; row <= NUM_BOXES; ++row) {
    gameCtx.moveTo(0, row * boxWidth);
    gameCtx.lineTo(gameCanvas.width, row * boxWidth);
  }

  for (let col = 0; col <= NUM_BOXES; ++col) {
    gameCtx.moveTo(col * boxWidth, 0);
    gameCtx.lineTo(col * boxWidth, gameCanvas.height);
  }
  gameCtx.stroke();

  // Make the center dividing line
  gameCtx.lineWidth = 5;
  gameCtx.beginPath();
  gameCtx.moveTo(Math.round(gameCanvas.width / 2 - 1), 0);
  gameCtx.lineTo(Math.round(gameCanvas.width / 2 - 1), gameCanvas.height);
  gameCtx.stroke();
  gameCtx.lineWidth = 1;
}

function handleBoxClick(e) {
  let cursorPosition = getCursorPosition(e);
  let pixel = gameCtx.getImageData(cursorPosition.x, cursorPosition.y, 1, 1).data;
  // If the pixel has 0 opacity then color it in when clicked (0 opacity means white)
  if (toolSelected === "filler" && (pixel[3] === 0 || pixel[0] === 255 && pixel[1] === 255 && pixel[2] === 255) && numBoxesUsed < MAX_BOX_COUNT) {
    if (host && cursorPosition.x < gameCanvas.width / 2) {
      let color = "#FF0000";
      numBoxesUsed += 1;
      colorBox(cursorPosition.x, cursorPosition.y, color);
    } else if (!host && cursorPosition.x > gameCanvas.width / 2) {
      let color = "#0000FF";
      numBoxesUsed += 1;
      colorBox(cursorPosition.x, cursorPosition.y, color);
    }
  } else if (toolSelected === "eraser") {
    let color = "#FFFFFF";
    if (host && pixel[0] === 255 && pixel[1] === 0) {
      numBoxesUsed -= 1;
      colorBox(cursorPosition.x, cursorPosition.y, color);
      // Make the center dividing line
      gameCtx.lineWidth = 5;
      gameCtx.beginPath();
      gameCtx.moveTo(Math.round(gameCanvas.width / 2 - 1), 0);
      gameCtx.lineTo(Math.round(gameCanvas.width / 2 - 1), gameCanvas.height);
      gameCtx.stroke();
      gameCtx.lineWidth = 1;
    } else if (!host && pixel[2] === 255 && pixel[1] === 0) {
      numBoxesUsed -= 1;
      colorBox(cursorPosition.x, cursorPosition.y, color);
      // Make the center dividing line
      gameCtx.lineWidth = 5;
      gameCtx.beginPath();
      gameCtx.moveTo(Math.round(gameCanvas.width / 2 - 1), 0);
      gameCtx.lineTo(Math.round(gameCanvas.width / 2 - 1), gameCanvas.height);
      gameCtx.stroke();
      gameCtx.lineWidth = 1;
    }
  }
}

function getCursorPosition(e) {
  let rect = gameCanvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
}

function colorBox(x, y, color) {
  let xBoxCoord = Math.floor(x / boxWidth);
  let yBoxCoord = Math.floor(y / boxHeight);
  let correctedX = xBoxCoord * boxWidth;
  let correctedY = yBoxCoord * boxHeight;

  gameCtx.beginPath();
  gameCtx.fillStyle = color;
  gameCtx.fillRect(correctedX, correctedY, boxWidth, boxHeight);
  gameCtx.stroke();
  gameCtx.beginPath();
  gameCtx.fillStyle = "#000000";
  gameCtx.rect(correctedX, correctedY, boxWidth, boxHeight);
  gameCtx.stroke();
}

function switchTool(tool) {
  if (tool === 'f') {
    toolSelected = "filler";
    let fillerButton = document.getElementById("filler-button");
    fillerButton.disabled = true;
    fillerButton.style.background = '#202020';
    fillerButton.style.color = 'white';
    let eraserButton = document.getElementById("eraser-button");
    eraserButton.disabled = false;
    eraserButton.style.background = 'white';
    eraserButton.style.color = 'black';
  } else {
    toolSelected = "eraser";
    let eraserButton = document.getElementById("eraser-button");
    eraserButton.disabled = true;
    eraserButton.style.background = '#202020';
    eraserButton.style.color = 'white';
    let fillerButton = document.getElementById("filler-button");
    fillerButton.disabled = false;
    fillerButton.style.background = 'white';
    fillerButton.style.color = 'black';
  }
}

async function startGame() {
  // Scale the game board down so that each box is represented by a single pixel on a new "canvas" represented by a 2D array
  let gameBoardArrayInitial = [];
  for (let row = 0; row < NUM_BOXES; ++row) {
    let innerArr = [];
    for (let boxInRow = 0; boxInRow < NUM_BOXES; ++boxInRow) {
      let cx = row * boxHeight + boxHeight / 2;
      let cy = boxInRow * boxHeight + boxHeight / 2;

      let pcolor = gameCtx.getImageData(cx, cy, 1, 1).data;
      if (pcolor.filter((e) => e === 0).length === 4 || pcolor.filter((e) => e === 255).length === 4) {
        innerArr.push({isAlive: false, controllingPlayer: null});
      } else {
        innerArr.push({isAlive: true, controllingPlayer: 1});
      }
    }
    gameBoardArrayInitial.push(innerArr);
  }

  let previousGen = makeCopy2D(gameBoardArrayInitial);
  let nextGen = makeCopy2D(gameBoardArrayInitial);
  function makeCopy2D(arr) {
    let newArr = [];
    for (let i = 0; i < arr.length; ++i) {
      let row = [];
      for (let j = 0; j < arr[i].length; ++j) {
        let cellCopy = {isAlive: arr[i][j].isAlive, controllingPlayer: arr[i][j].controllingPlayer};
        row.push(cellCopy);
      }
      newArr.push(row);
    }
    return newArr;
  }

  for (let genNum = 0; genNum < MAX_GEN_NUM; ++genNum) {
    await sleep(TIME_PER_GENERATION);
    // console.log("--------------------");
    // console.log("GENERATION " + (genNum + 1));
    // console.log("--------------------");
    // Run the simulation
    for (let col = 0; col < NUM_BOXES; ++col) {
      for (let row = 0; row < NUM_BOXES; ++row) {
        // console.log("curCell = (" + row + ", " + col + ")");
        const cell = previousGen[col][row]; // specific box
        let numNeighbors = 0; // amount of neighbors cell has
        for (let i = -1; i <= 1; ++i) { //finding current cell's neighbors. 3x3 square w/o the center square
          for (let j = -1; j <= 1; ++j) {
            if (i === 0 && j === 0) { continue; }
            let x_cell = col + i;
            let y_cell = row + j;

            if (x_cell >= 0 && y_cell >= 0 && x_cell < NUM_BOXES && y_cell < NUM_BOXES) {
              let currentNeighbor = previousGen[col + i][row + j];
              // console.log("cell at (" + row + ", " + col + ")" + (currentNeighbor.isDead ? " is dead" : " is alive"));
              if (currentNeighbor.isAlive) { numNeighbors += 1; }
            }
          }
        }

        // console.log("cell at (" + row + ", " + col + ") has " + numNeighbors + " neighbors");

        //rules of game
        //underpopulation
        if(cell.isAlive && numNeighbors < 2) { //if cur cell has less than 2 neighbors
          // console.log("Killing cell at (" + row + ", " + col + ") underpopulation");
          nextGen[col][row].isAlive = false;
          nextGen[col][row].controllingPlayer = null;
        }
        //overpopulation
        else if(cell.isAlive && numNeighbors > 3 ) { //if cur cell has more than 3 neighbors
          // console.log("Killing cell at (" + row + ", " + col + ") overpopulation");
          nextGen[col][row].isAlive = false;
          nextGen[col][row].controllingPlayer = null;
        }
        //revive
        else if(!cell.isAlive && numNeighbors === 3 ) { //if cur cell has exactly 3 neighbors and is dead
          // console.log("Reviving cell at (" + row + ", " + col + ")");
          nextGen[col][row].isAlive = true;
          nextGen[col][row].controllingPlayer = 1;
        }
      }
    }
    await(showOnScreen(nextGen));
    previousGen = makeCopy2D(nextGen);
  }
}

function showOnScreen(generationInfo) {
  // console.log(generationInfo);
  for (let i = 0; i < generationInfo.length; ++i) {
    for (let j = 0; j < generationInfo[i].length; ++j) {
      // scale the coordinates back up to full size
      let x = i * boxWidth + boxWidth / 2;
      let y = j * boxHeight + boxHeight / 2;
      // console.log("x: " + x + "   y: " + y);
      if (generationInfo[i][j].isAlive) {
        colorBox(x, y, "#FF0000");
      } else {
        colorBox(x, y, "#FFFFFF");
      }
      // gameCtx.beginPath();
      // if (i >= 3 && i <= 10) {
      //   gameCtx.fillStyle = "blue";
      // }
      // if (j >= 3 && j <= 10) {
      //   gameCtx.fillStyle = "blue";
      // }
      // gameCtx.fillRect(x - 4, y - 4, 8, 8);
      // gameCtx.stroke();
    }
  }
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
