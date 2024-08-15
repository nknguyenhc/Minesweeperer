import { SimpleSolver } from "../solver/simple-solver";
import { ISolver } from "../solver/solver";

function readline(): string {
  return '';
}

class Codingame {
  readonly solver: ISolver;
  readonly h: number = 16;
  readonly w: number = 30;
  isFirstTime: boolean = true;

  constructor() {
    this.solver = new SimpleSolver(this.w, this.h);
  }

  run(): void {
    while (true) {
      if (this.isFirstTime) {
        this.readCells();
        this.openFirstCell();
        this.isFirstTime = false;
      }
      const cells = this.getCells();
      this.handleCells(cells);
    }
  }

  getCells(): number[][] {
    const cells: number[][] = [];
    for (let i = 0; i < this.h; i++) {
      const inputs: string[] = readline().split(' ');
      const line: number[] = [];
      for (let j = 0; j < this.w; j++) {
        const cell: string = inputs[j]; // '?' if unknown, '.' if no mines nearby, '1'-'8' otherwise
        switch (cell) {
          case '?':
            line.push(-1);
            break;
          case '.':
            line.push(0);
            break;
          default:
            line.push(parseInt(cell));
            break;
        }
      }
      cells.push(line);
    }
    return cells;
  }

  readCells(): void {
    for (let i = 0; i < this.h; i++) {
      readline();
    }
  }

  openFirstCell(): void {
    console.log('15 7');
  }

  handleCells(cells: number[][]): void {
    const [actions, _] = this.solver.update(cells);
    for (const [i, action] of actions.entries()) {
      if (i > 0) {
        this.readCells();
      }
      console.log(`${action.x} ${action.y}`);
    }
  }
}

new Codingame().run();
