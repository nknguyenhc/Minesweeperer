import { Coordinate, ISolver, Solver } from "../solver/solver";

function readline(): string {
  return '';
}

class Codingame {
  readonly h: number = 16;
  readonly w: number = 30;
  readonly solver: ISolver = new Solver(this.w, this.h);
  isFirstTime: boolean = true;
  readonly actions: Coordinate[] = [];
  pointer: number = 0;

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

  private getCells(): number[][] {
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

  private readCells(): void {
    for (let i = 0; i < this.h; i++) {
      readline();
    }
  }

  openFirstCell(): void {
    console.log('15 7');
  }

  handleCells(cells: number[][]): void {
    const [actions, watchForMines] = this.solver.update(cells);
    if (!watchForMines) {
      this.actions.push(...actions);
    }
    const action = this.actions[this.pointer];
    if (action) {
      console.log(`${action.x} ${action.y}`);
      this.pointer++;
    } else {
      const randomAction = actions[0];
      console.log(`${randomAction.x} ${randomAction.y}`);
    }
  }
}

new Codingame().run();
