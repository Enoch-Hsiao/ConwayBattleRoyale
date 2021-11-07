let MAX_GEN_NUM = null;
let NUM_BOXES = null;
let MAX_BOX_COUNT = null;
let TIME_PER_GENERATION = null;
let CAN_EDIT = false;
let resetGame = false;

const gameCanvas = document.getElementById("game-canvas");
const gameCtx = gameCanvas.getContext('2d');
const gameContainerHeight = Math.floor(document.getElementById("game-container").getBoundingClientRect().height);
gameCtx.imageSmoothingEnabled = false;
gameCanvas.width = gameContainerHeight;
gameCanvas.height = gameContainerHeight;

let boxWidth = null;
let boxHeight = boxWidth;

let clicked = false;
let numBoxesUsed = 0;
let toolSelected = null;

function initializeGame() {
  if(setParams()) {
    document.getElementById("submit").disabled = true;
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
    CAN_EDIT = true;
  }
}

function setParams() {
  let ng = document.getElementById("numGenerations").value;
  let nb = document.getElementById("numBoxes").value;
  let mbc = document.getElementById("maxPixelNum").value;
  let tpg = document.getElementById("timePerGen").value;
  if ( ng < 50 || ng > 500) {
    alert("Please set the number of generations to something between 50 and 500");
    return false;
  } else if(nb < 10 || nb > 100 || nb % 2 !== 0) {
    alert("Please set the board size to an even number between 10 and 100");
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
    MAX_BOX_COUNT = mbc;
    TIME_PER_GENERATION = tpg;
    CAN_EDIT = true;
    boxWidth = gameCanvas.width / NUM_BOXES;
    boxHeight = boxWidth;
    resetGame = false;
    return true;
  }
}

function makeGrid() {
  gameCtx.beginPath();
  for (let row = 0; row <= NUM_BOXES; ++row) {
    gameCtx.moveTo(0, row * boxWidth);
    gameCtx.lineTo(gameCanvas.width, row * boxWidth);
  }

  for (let col = 0; col <= NUM_BOXES; ++col) {
    gameCtx.moveTo(col * boxWidth, 0);
    gameCtx.lineTo(col * boxWidth, gameCanvas.height);
  }

  // Make the center dividing line
  gameCtx.moveTo(Math.round(gameCanvas.width / 2), 0);
  gameCtx.lineTo(Math.round(gameCanvas.width / 2), gameCanvas.height);
  gameCtx.stroke();
}
