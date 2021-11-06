
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gameBoardDiv = document.getElementById("gameBoard").getBoundingClientRect();

const numBoxes = 30;
canvas.width = gameBoardDiv.height;
canvas.height = gameBoardDiv.height;
const boxSize = gameBoardDiv.height/ numBoxes;

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
    for (let col = 0; col < numBoxes; col++) {
        for (let row = 0; row < numBoxes; row++) {
            const box = grid[col][row];
            ctx.beginPath();
            ctx.rect(col * boxSize, row * boxSize, boxSize, boxSize);
            ctx.stroke();
        }
    }
}
