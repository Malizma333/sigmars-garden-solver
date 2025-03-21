const validPairs = "1,1 1,2 1,3 1,4 1,5 2,1 3,1 4,1 5,1 2,2 3,3 4,4 5,5 13,14 14,13".split(" ");
const metalPairsA = "6,7 6,8 6,9 6,10 6,11".split(" ");
const metalPairsB = "7,6 8,6 9,6 10,6 11,6".split(" ");
const scale = 20;
const elements = [
  { color: "white", symbol: "" },
  { color: "beige", symbol: "🜔" },
  { color: "darkturquoise", symbol: "🜁" },
  { color: "red", symbol: "🜂" },
  { color: "blue", symbol: "🜄" },
  { color: "green", symbol: "🜃" },
  { color: "white", symbol: "☿" },
  { color: "darkgray", symbol: "♄" },
  { color: "goldenrod", symbol: "♃" },
  { color: "sienna", symbol: "♂" },
  { color: "sandybrown", symbol: "♀" },
  { color: "dimgray", symbol: "☽" },
  { color: "gold", symbol: "☉" },
  { color: "bisque", symbol: "🜍" },
  { color: "darkslategray", symbol: "🜞" },
];
const neighbor = Array(91).fill(0).map((e, i) => {
  let neighbors = [];
  const sides = [
    [0, 1, 2, 3, 4, 5],
    [5, 12, 20, 29, 39, 50],
    [50, 60, 69, 77, 84, 90],
    [90, 89, 88, 87, 86, 85],
    [85, 78, 70, 61, 51, 40],
    [40, 30, 21, 13, 6, 0],
  ];

  if (sides[4].includes(i) || sides[5].includes(i)) {
    neighbors.push(-1);
  } else {
    neighbors.push(i - 1);
  }

  if (sides[5].includes(i) || sides[0].includes(i)) {
    neighbors.push(-1);
  } else {
    if (i <= 12 || i >= 85) {
      neighbors.push(i - 7);
    } else if (i <= 20 || i >= 78) {
      neighbors.push(i - 8);
    } else if (i <= 29 || i >= 70) {
      neighbors.push(i - 9);
    } else if (i <= 39 || i >= 61) {
      neighbors.push(i - 10);
    } else {
      neighbors.push(i - 11);
    }
  }

  if (sides[0].includes(i) || sides[1].includes(i)) {
    neighbors.push(-1);
  } else {
    if (i <= 11 || i >= 85) {
      neighbors.push(i - 6);
    } else if (i <= 19 || i >= 78) {
      neighbors.push(i - 7);
    } else if (i <= 28 || i >= 70) {
      neighbors.push(i - 8);
    } else if (i <= 38 || i >= 61) {
      neighbors.push(i - 9);
    } else {
      neighbors.push(i - 10);
    }
  }

  if (sides[1].includes(i) || sides[2].includes(i)) {
    neighbors.push(-1);
  } else {
    neighbors.push(i + 1);
  }

  if (sides[2].includes(i) || sides[3].includes(i)) {
    neighbors.push(-1);
  } else {
    if (i <= 5 || i >= 78) {
      neighbors.push(i + 7);
    } else if (i <= 12 || i >= 70) {
      neighbors.push(i + 8);
    } else if (i <= 20 || i >= 61) {
      neighbors.push(i + 9);
    } else if (i <= 29 || i >= 51) {
      neighbors.push(i + 10);
    } else {
      neighbors.push(i + 11);
    }
  }

  if (sides[3].includes(i) || sides[4].includes(i)) {
    neighbors.push(-1);
  } else {
    if (i <= 5 || i >= 79) {
      neighbors.push(i + 6);
    } else if (i <= 12 || i >= 71) {
      neighbors.push(i + 7);
    } else if (i <= 20 || i >= 62) {
      neighbors.push(i + 8);
    } else if (i <= 29 || i >= 52) {
      neighbors.push(i + 9);
    } else {
      neighbors.push(i + 10);
    }
  }

  return neighbors;
});

const indexMap = {};
(function() {
  let index = 0;

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6 + i; j++) {
      indexMap[index] = [i, j];
      index += 1;
    }
  }

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 10 - i; j++) {
      indexMap[index] = [i + 6, j];
      index += 1;
    }
  }
})();

class Game {
  constructor() {
    const canvas = document.getElementById("main-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.ctx = canvas.getContext("2d");
    this.board = Array(91).fill(0);
    this.meta_visited = new Set();
    this.minFound = 91;

    this.drawBoard();
  }

  surrounded(index, visited) {
    let points = [];

    for (const n of neighbor[index]) {
      points.push(n === -1 || visited.has(n));
    }

    let count = 0;

    for (let i = 0; i < 12; i++) {
      if (points[i % 6]) {
        count += 1;
      } else {
        count = 0;
      }

      if (count > 2) {
        return false;
      }
    }

    return true;
  }

  async solveHelper(state) {
    const strState = JSON.stringify([state.metal, ...state.visited].sort());
    if (this.meta_visited.has(strState)) {
      return null;
    }

    this.meta_visited.add(strState);

    if (this.minFound >= 91 - state.visited.size) {
      this.minFound = 91 - state.visited.size;
      await new Promise(resolve => {
        window.requestAnimationFrame(() => this.drawBoard(null, state.visited));
        window.requestAnimationFrame(resolve);
      });
    }

    if (performance.now() - this.start_time > 1000) {
      this.start_time = performance.now();
      await new Promise(resolve => {
        window.requestAnimationFrame(resolve);
      });
    }

    if (state.visited.size === 91) {
      return [];
    }

    for (let i = 0; i < 91; i++) {
      if (state.visited.has(i) || this.surrounded(i, state.visited)) continue;

      if (this.board[i] === 12 && state.metal === 5) {
        const result = await this.solveHelper({
          visited: state.visited.union(new Set([i])),
          metal: state.metal,
        });

        if (result !== null) {
          return [[i]].concat(result);
        }
      }

      for (let j = i + 1; j < 91; j++) {
        if (state.visited.has(j) || this.surrounded(j, state.visited)) continue;

        const pair = `${this.board[i]},${this.board[j]}`;

        if (validPairs.includes(pair)) {
          const result = await this.solveHelper({
            visited: state.visited.union(new Set([i, j])),
            metal: state.metal,
          });

          if (result !== null) {
            return [[i, j]].concat(result);
          }
        }

        if (state.metal === metalPairsA.indexOf(pair) || state.metal === metalPairsB.indexOf(pair)) {
          const result = await this.solveHelper({
            visited: state.visited.union(new Set([i, j])),
            metal: state.metal + 1,
          });

          if (result !== null) {
            return [[i, j]].concat(result);
          }
        }
      }
    }

    return null;
  }

  async solve() {
    const visited = new Set();

    for (let i = 0; i < 91; i++) {
      if (this.board[i] === 0) {
        visited.add(i);
      }
    }

    this.start_time = performance.now();

    const result = await this.solveHelper({ metal: 0, visited });
    const converted = Array(91).fill("");

    if (result === null) {
      console.error("Failed to solve");
      return;
    }

    for (let i = 0; i < result.length; i++) {
      converted[result[i][0]] = i + 1;
      if (result[i].length > 1) {
        converted[result[i][1]] = i + 1;
      }
    }

    this.drawBoard(converted);
  }

  drawBoard(result = null, visited = null) {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let index = 0; index < 91; index++) {
      if (visited && visited.has(index)) continue;

      const [i, j] = indexMap[index];
      this.drawHex(
        ((j + (index > 50 ? i - 5 : 0) - i / 2) * Math.sqrt(3) + 15) * scale,
        (i * 1.5 + 5) * scale,
        scale,
        elements[this.board[index]].color,
        result === null ? elements[this.board[index]].symbol : result[index]
      );
    }
  }

  drawHex(x, y, size, color, symbol) {
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      let xx = x + size * Math.cos(Math.PI / 3 * i + Math.PI / 6);
      let yy = y + size * Math.sin(Math.PI / 3 * i + Math.PI / 6);
      this.ctx.lineTo(xx, yy);
    }
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.fillStyle = "black";
    this.ctx.font = "18px serif";
    this.ctx.fillText(symbol, x - 8, y + 4);
  }

  editBoard(newBoard) {
    const b = newBoard.split("");

    if (b.length < 91) {
      b.push(...Array(91 - b.length).fill("1"))
    }

    if (b.length > 91) {
      b.splice(91, b.length - 91);
    }

    for (let i = 0; i < b.length; i++) {
      let x = "1234qwerasdfzxc".indexOf(b[i])
      if (0 <= x && x <= 15) {
        b[i] = x;
      } else {
        return;
      }
    }

    this.board = b;
    this.drawBoard();
  }
}

function main() {
  const game = new Game();
  document.getElementById("board-input").addEventListener("input", (e) => game.editBoard(e.target.value));
  document.getElementById("solve-button").addEventListener("click", () => game.solve());
}

main();
/*
qq1111s33111wf1ew11qxe1wxwe31cdx3cq1c21411121z44a4e1112q1xrw3112ewq11114w3w1114311q11cq4341
*/