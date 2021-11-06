const MAX_GEN_NUM = 100;
const NUM_BOXES = 30;
const maxBoxCount = 20;
const gameCanvas = document.getElementById("game-canvas");
const gameCtx = gameCanvas.getContext('2d');
const gameContainerHeight = Math.floor(document.getElementById("game-container").getBoundingClientRect().height);
gameCtx.imageSmoothingEnabled = false;

gameCanvas.width = gameContainerHeight;
gameCanvas.height = gameContainerHeight;

let boxWidth = gameCanvas.width / NUM_BOXES;
let boxHeight = boxWidth;

makeGrid();
let clicked = false;
let numBoxesUsed = 0;
let toolSelected = "filler";

gameCanvas.addEventListener('mousedown', function(e) {
  clicked = true;
  handleBoxClick(e);
});

gameCanvas.addEventListener('mouseup', function(e) {
  clicked = false;
});

gameCanvas.addEventListener('mousemove', function(e) {
  if (clicked) handleBoxClick(e);
});

function handleBoxClick(e) {
  let cursorPosition = getCursorPosition(e);
  let pixel = gameCtx.getImageData(cursorPosition.x, cursorPosition.y, 1, 1).data;
  // If the pixel has 0 opacity then color it in when clicked (0 opacity means white)
  if (toolSelected === "filler" && (pixel[3] === 0 || pixel[0] === 255 && pixel[1] === 255 && pixel[2] === 255) && numBoxesUsed < maxBoxCount) {
    let color = "#FF0000";
    // TODO: UPDATE LIVE COUNTER ON SCREEN
    numBoxesUsed += 1;
    colorBox(cursorPosition.x, cursorPosition.y, color);
  } else if (toolSelected === "eraser" && pixel[0] === 255 && pixel[1] === 0) {
    let color = "#FFFFFF";
    // TODO: UPDATE LIVE COUNTER ON SCREEN
    numBoxesUsed -= 1;
    colorBox(cursorPosition.x, cursorPosition.y, color);
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

function makeGrid() {
  gameCtx.beginPath();
  for (let row = 0; row < NUM_BOXES; ++row) {
      gameCtx.moveTo(0, row * boxWidth);
      gameCtx.lineTo(gameCanvas.width, row * boxWidth);
  }

  for (let col = 0; col < NUM_BOXES; ++col) {
    gameCtx.moveTo(col * boxWidth, 0);
    gameCtx.lineTo(col * boxWidth, gameCanvas.height);
  }

  // Make the center dividing line
  gameCtx.moveTo(Math.round(gameCanvas.width / 2), 0);
  gameCtx.lineTo(Math.round(gameCanvas.width / 2), gameCanvas.height);
  gameCtx.stroke();
}

function switchTool(tool) {
  if (tool === 'f') {
    toolSelected = "filler";
    document.getElementById("fillerButton").disabled = true;
    document.getElementById("eraserButton").disabled = false;
  } else {
    toolSelected = "eraser";
    document.getElementById("eraserButton").disabled = true;
    document.getElementById("fillerButton").disabled = false;
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
    await sleep(250);
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
