
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gameBoardDiv = document.getElementById("gameBoard").getBoundingClientRect();

const numBoxes = 100;
canvas.width = gameBoard.width;
canvas.height = gameBoard.height;

const cols = numBoxes;
const rows = numBoxes;

//building grid with 2D Array
function buildGrid(){
    return new Array(cols).fill(null) //fills up array with "stuff" so its iterable
    .map(() => new Array(rows).fill(0))
}

const grid = buildGrid();
render(grid);

function render(grid) {
    for(let col = 0; col < grid.length; col++){
        for (let row = 0; row < grid[col].length; row++){
            const cell = grid[col][row];

            ctx.beginPath();
            ctx.rect(col * numBoxes, row * numBoxes, numBoxes, numBoxes);
            ctx.stroke();
        }
    }
}
