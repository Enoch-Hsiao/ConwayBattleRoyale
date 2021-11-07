import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.3.0/firebase-app.js'
import { getDatabase, ref, set, push, child, get, onValue } from "https://www.gstatic.com/firebasejs/9.3.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKgqYntAREPNvVCrnhFyPCW88CbLjnEEU",
  authDomain: "conwaybattleroyale.firebaseapp.com",
  projectId: "conwaybattleroyale",
  storageBucket: "conwaybattleroyale.appspot.com",
  messagingSenderId: "399526712961",
  appId: "1:399526712961:web:50fd2048336be7bdeb1f80"
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
document.getElementById("game-PIN-value").innerHTML = 'Game PIN: ' + keyValueForGame

const db = getDatabase()
const dbRef = ref(getDatabase());

let gameSessionRef = ref(db, `gameSessions/${keyValueForGame}`);
function gameDataChange(host) {
  onValue(gameSessionRef, (snapshot) => {
    gameData = snapshot.val();
    // console.log(gameData);
    if (gameData.player2Present && gameData.gameState == "configuration") {
      reset();
      document.getElementById("start-new-game").style.display = 'none';
      document.getElementById("generation-number-div").style.display = 'none';
      document.getElementById("submit-button").style.display = 'none';
      document.getElementById("join-game").style.display = "none";
      document.getElementById("max-pixel-num").innerHTML = `Number of Pixels:`;
      document.getElementById("number-of-iterations").innerHTML = `Number of Iterations:`;
      document.getElementById("number-of-board-size").innerHTML = `Board Side Length:`;
      document.getElementById("time-per-generation").innerHTML = `Time Per Generation (ms):`;
      player2Present = true;
      if(host) {
        document.getElementById("game-state").innerHTML = "Please enter your configuration for the game as the host.";
        document.getElementById("form-game-parameters").style.display = "block";
        document.getElementById("player2-parameters").style.display = "none";
        document.getElementById("submit").style.display = 'block';
      } else {
        document.getElementById("game-state").innerHTML = "Please wait for the host to configure the game";
        document.getElementById("form-game-parameters").style.display = "none";
        document.getElementById("player2-parameters").style.display = "block";
        document.getElementById("submit").style.display = "none";
        
      }
    } else if (gameData.player2Present && gameData.gameState == "preparation") {
      if (gameData.player1Blocks && gameData.player2Blocks) {
        gameData.gameState = 'fight'
        set(ref(database, 'gameSessions/' + keyValueForGame), gameData);
        return;
      }
      document.getElementById("game-state").innerHTML = "Please prepare your blocks.";
      document.getElementById("game-buttons").style.display = 'block';
      document.getElementById("submit-button").style.display = 'block';
      document.getElementById("form-game-parameters").style.display = "none";
      document.getElementById("player2-parameters").style.display = "block";
      document.getElementById("max-pixel-num").innerHTML = `Number of Pixels: ${gameData.maxNumPixels}`;
      document.getElementById("number-of-iterations").innerHTML = `Number of Iterations: ${gameData.iterations}`;
      document.getElementById("number-of-board-size").innerHTML = `Board Side Length: ${gameData.boardSize}`;
      document.getElementById("time-per-generation").innerHTML = `Time Per Generation (ms): ${gameData.timePerGeneration}`;
      if(host) {
        document.getElementById("submit").style.display = "none";
      } else {
        MAX_GEN_NUM = gameData.iterations;
        NUM_BOXES = gameData.boardSize;
        MAX_BOX_COUNT = gameData.maxNumPixels;
        TIME_PER_GENERATION = gameData.timePerGeneration;
        boxWidth = gameCanvas.width / NUM_BOXES;
        boxHeight = boxWidth;
      }
      if (host && gameData.player2Blocks) {
        document.getElementById("game-state").innerHTML = "Player 2 has submitted and is waiting for your submission!";
      } else if (!host && gameData.player1Blocks) {
        document.getElementById("game-state").innerHTML = "Player 1 has submitted and is waiting for your submission!";
      }
      initializeGame();
    } else if (gameData.player2Present && gameData.gameState === "fight") {
      document.getElementById("game-buttons").style.display = 'none';
      document.getElementById("game-state").innerHTML = `Countdown 3`;
      countdownGame();
      document.getElementById("submit-button").style.display = 'none';
      document.getElementById("generation-number-div").style.display = 'block';
    }
  });
}

function countdownGame() {
  let countDownDate = new Date().getTime() + 4000;
  let timer = setInterval(function() {
    let now = new Date().getTime();
    let distance = countDownDate - now;
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
    document.getElementById("game-state").innerHTML = `Countdown ${seconds}`;
    if (seconds < 1) {
      clearInterval(timer);
      document.getElementById("game-state").innerHTML = "Fight!";
      simulate2Players(gameData.player1Blocks, gameData.player2Blocks);
    }
  }, 100);
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
    document.getElementById("game-PIN-value").innerHTML = 'Game PIN: ' + PIN;
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
document.getElementById('Enter Game').addEventListener('click', checkPIN);
document.getElementById('submit-button').addEventListener('click', compressBoard);
document.getElementById('start-new-game').addEventListener('click', resetBoard);

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

initialConfig();

function initialConfig() {
  reset();
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

function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

function setParams() {
  let ng = document.getElementById("numGenerations").value;
  let nb = document.getElementById("numBoxes").value;
  let mbc = document.getElementById("maxPixelNum").value;
  let tpg = document.getElementById("timePerGen").value;
  if (!mbc || !isInt(mbc) || mbc < 0) {
    alert("Please set the max number of pixels to a valid number greater than 0");
    return false;
  } else if (!ng || !isInt(ng) || ng < 25 || ng > 1000) {
    alert("Please set the number of generations to a valid number between 25 and 1000");
    return false;
  } else if(!nb || !isInt(nb) || nb < 10 || nb > 50 || nb % 2 !== 0) {
    alert("Please set the board side length to a valid even number between 10 and 50");
    return false;
  } else if(!tpg || !isInt(tpg) || tpg < 25 || tpg > 100) {
    alert("Please set the time per generation to a valid number between 25 and 100 ms");
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
    gameData = {
      maxNumPixels: mbc,
      iterations: ng,
      boardSize: nb,
      timePerGeneration: tpg,
      gameState: 'preparation',
      player2Present: true
    }
    set(ref(database, 'gameSessions/' + keyValueForGame), gameData);
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
  gameCtx.strokeStyle = "#000000";
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

function showOnScreen(generationInfo) {
  for (let i = 0; i < generationInfo.length; ++i) {
    for (let j = 0; j < generationInfo[i].length; ++j) {
      // scale the coordinates back up to full size
      let x = i * boxWidth + boxWidth / 2;
      let y = j * boxHeight + boxHeight / 2;
      // console.log("x: " + x + "   y: " + y);
      if (generationInfo[i][j].isAlive && generationInfo[i][j].controllingPlayer === 1) {
        colorBox(x, y, "#FF0000");
      } else if (generationInfo[i][j].isAlive && generationInfo[i][j].controllingPlayer === 2) {
        colorBox(x, y, "#0000FF");
      } else {
        colorBox(x, y, "#FFFFFF");
      }
    }
  }
}

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

async function simulate2Players(p1Start, p2Start) {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  let combinedSmallArr = [];
  for (let j = 0; j < NUM_BOXES; ++j) {
    let newRow = []
    for (let i = 0; i < NUM_BOXES; ++i) {
      if (j <= NUM_BOXES / 2 - 1) {
        newRow.push(p1Start[i][j]);
      } else {
        newRow.push(p2Start[i][j]);
      }
    }
    combinedSmallArr.push(newRow);
  }
  showOnScreen(combinedSmallArr);
  await sleep(3000);
  let previousGen = makeCopy2D(combinedSmallArr);
  let nextGen = makeCopy2D(combinedSmallArr);

  let player1Count = 0
  let player2Count = 0;
  for (let genNum = 0; genNum < MAX_GEN_NUM; ++genNum) {
    let changesExist = false;
    document.getElementById("genNumCounter").innerHTML = genNum + 1;
    await sleep(TIME_PER_GENERATION);
    if (genNum < MAX_GEN_NUM - 1) {
      player1Count = 0;
      player2Count = 0;
    }
    for (let row = 0; row < NUM_BOXES; ++row) {
      for (let col = 0; col < NUM_BOXES; ++col) {
        const cell = previousGen[row][col]; // specific box
        if (cell.controllingPlayer === 1) {
          player1Count++;
        } else if (cell.controllingPlayer === 2) {
          player2Count++;
        }
        let numNeighbors = {player1: 0, player2: 0}; // amount of neighbors cell has
        for (let i = -1; i <= 1; ++i) { //finding current cell's neighbors. 3x3 square w/o the center square
          for (let j = -1; j <= 1; ++j) {
            if (i === 0 && j === 0) { continue; }
            let x_cell = row + i;
            let y_cell = col + j;

            if (x_cell >= 0 && y_cell >= 0 && x_cell < NUM_BOXES && y_cell < NUM_BOXES) {
              let currentNeighbor = previousGen[row + i][col + j];
              // console.log("cell at (" + row + ", " + col + ")" + (currentNeighbor.isDead ? " is dead" : " is alive"));
              if (currentNeighbor.isAlive) { 
                if (currentNeighbor.controllingPlayer === 1) {
                  numNeighbors.player1 += 1
                } else {
                  numNeighbors.player2 += 1
                }
              }
            }
          }
        }
        let numNeighborsCount = numNeighbors.player1 + numNeighbors.player2;
        // console.log("cell at (" + row + ", " + col + ") has " + numNeighbors + " neighbors");

        //rules of game
        //underpopulation
        if(cell.isAlive && numNeighborsCount < 2) { //if cur cell has less than 2 neighbors
          changesExist = true;
          // console.log("Killing cell at (" + row + ", " + col + ") underpopulation");
          nextGen[row][col].isAlive = false;
          nextGen[row][col].controllingPlayer = 0;
        }
        //overpopulation
        else if(cell.isAlive && numNeighborsCount > 3) { //if cur cell has more than 3 neighbors
          changesExist = true;
          // console.log("Killing cell at (" + row + ", " + col + ") overpopulation");
          nextGen[row][col].isAlive = false;
          nextGen[row][col].controllingPlayer = 0;
        }
        //revive
        else if(!cell.isAlive && numNeighborsCount === 3) { //if cur cell has exactly 3 neighbors and is dead
          changesExist = true;
          // console.log("Reviving cell at (" + row + ", " + col + ")");
          nextGen[row][col].isAlive = true;
          nextGen[row][col].controllingPlayer = (numNeighbors.player1 > numNeighbors.player2 ? 1 : 2);
        }
      }
    }
    if (player1Count === 0 && player2Count === 0) {
      determineWinner(false, true);
      return;
    } else if (player1Count === 0) {
      determineWinner(false, false);
      return;
    } else if (player2Count === 0) {
      determineWinner(true, false);
      return;
    }
    await(showOnScreen(nextGen));
    if (!changesExist) { break; }
    previousGen = makeCopy2D(nextGen);
  }
  if (player1Count > player2Count) {
    determineWinner(true, false);
  } else if (player1Count < player2Count) {
    determineWinner(false, false);
  } else if (player1Count === player2Count) {
    determineWinner(false, true);
  } 
}

async function determineWinner(player1Wins, isTie) {
  if(player1Wins) {
    document.getElementById("game-state").innerHTML = "Player 1 Wins!"
  } else if (!player1Wins & !isTie) {
    document.getElementById("game-state").innerHTML = "Player 2 Wins!"
  } else {
    document.getElementById("game-state").innerHTML = "Tie"
  }
  await sleep(3000);
  if (host) {
    document.getElementById("start-new-game").style.display = 'block';
  }
}

function compressBoard() {
  let gameBoardArrayInitial = [];
  for (let row = 0; row < NUM_BOXES; ++row) {
    let innerArr = [];
    for (let boxInRow = 0; boxInRow < NUM_BOXES; ++boxInRow) {
      let cx = boxInRow * boxHeight + boxHeight / 2;
      let cy = row * boxHeight + boxHeight / 2;

      let pcolor = gameCtx.getImageData(cx, cy, 1, 1).data;
      if (pcolor.filter((e) => e === 0).length === 4 || pcolor.filter((e) => e === 255).length === 4) {
        innerArr.push({isAlive: false, controllingPlayer: 0});
      } else {
        innerArr.push({isAlive: true, controllingPlayer: (host ? 1 : 2)});
      }
    }
    gameBoardArrayInitial.push(innerArr);
  }
  if (host) {
    gameData['player1Blocks'] = gameBoardArrayInitial;
  } else {
    gameData['player2Blocks'] = gameBoardArrayInitial;
  }
  set(ref(database, 'gameSessions/' + keyValueForGame), gameData);
  document.getElementById("submit-button").style.display = 'none';
  if (host && !gameData.player2Blocks || !host && !gameData.player1Blocks) {
    document.getElementById("game-state").innerHTML = "Waiting for other player to submit.";
  }
  document.getElementById("game-buttons").style.display = 'none';
  return gameBoardArrayInitial;
}

function resetBoard() {
  gameData.gameState = 'configuration';
  gameData.player1Blocks = null;
  gameData.player2Blocks = null;
  set(ref(database, 'gameSessions/' + keyValueForGame), gameData);
}
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function reset() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  document.getElementById("numGenerations").disabled = false;
  document.getElementById("numBoxes").disabled = false;
  document.getElementById("maxPixelNum").disabled = false;
  document.getElementById("timePerGen").disabled = false;
  document.getElementById("genNumCounter").innerHTML = 0;
  MAX_GEN_NUM = null;
  NUM_BOXES = null;
  MAX_BOX_COUNT = null;
  TIME_PER_GENERATION = null;
  clicked = false;
  numBoxesUsed = 0;
  document.getElementById("submit").disabled = false;
}
