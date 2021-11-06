const MAX_GEN_NUM = 1000;
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

function startGame() {
  // Scale the game board down so that each box is represented by a single pixel on a new "canvas" represented by a 2D array
  let gameBoardArray = [];
  for (let row = 0; row < NUM_BOXES; ++row) {
    let innerArr = [];
    for (let boxInRow = 0; boxInRow < NUM_BOXES; ++boxInRow) {
      let centerCoord = {cx: boxInRow * boxHeight + boxHeight / 2, cy: row * boxHeight + boxHeight / 2}
      let pcolor = gameCtx.getImageData(centerCoord.cx, centerCoord.cy, 1, 1).data;
      if (pcolor.filter((e) => e === 0).length === 4 || pcolor.filter((e) => e === 255).length === 4) {
        innerArr.push({isDead: true, controllingPlayer: null});
      } else {
        innerArr.push({isDead: false, controllingPlayer: 1});
      }
    }
    gameBoardArray.push(innerArr);
  }

  console.log(gameBoardArray);

  for (let genNum = 0; genNum < MAX_GEN_NUM; ++genNum) {
    // Run the simulation
  }
}
