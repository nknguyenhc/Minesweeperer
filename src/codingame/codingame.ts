import { Coordinate, Solver } from "../solver/solver";
import { isMainThread, parentPort, Worker } from "worker_threads";

function readline(): string {
  return '';
}

const h: number = 16;
const w: number = 30;

class Codingame {
  readonly actions: Coordinate[] = [];
  pointer: number = 0;
  cells: number[][] = [];
  readonly timePerStep: number = 49;
  randomAction: Coordinate = { x: 15, y: 7 };

  run(): void {
    this.readCells();
    this.openCell();
    setInterval(() => this.openCell(), this.timePerStep);
    this.solve(this.timePerStep);
  }

  private getCells(): void {
    const cells: number[][] = [];
    for (let i = 0; i < h; i++) {
      const inputs: string[] = readline().split(' ');
      const line: number[] = [];
      for (let j = 0; j < w; j++) {
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
    this.cells = cells;
  }

  private readCells(): void {
    for (let i = 0; i < h; i++) {
      readline();
    }
  }

  private solve(timeLimit: number): void {
    const worker = new Worker(__filename);
    worker.postMessage({ cells: this.cells, timeLimit: timeLimit });
    worker.on('message', (result: [Coordinate[], boolean]) => {
      const [actions, watchOutForMine] = result;
      if (!watchOutForMine) {
        this.actions.push(...actions);
      } else {
        this.randomAction = actions[0];
      }
      worker.postMessage({ cells: this.cells, timeLimit: this.timePerStep * actions.length });
    });
  }

  private openCell(): void {
    const action = this.actions[this.pointer];
    if (action) {
      console.log(`${action.x} ${action.y}`);
      this.pointer++;
    } else {
      console.log(`${this.randomAction.x} ${this.randomAction.y}`);
    }
    this.getCells();
  }
}

if (isMainThread) {
  new Codingame().run();
} else {
  const solver = new Solver(w, h);
  parentPort!.on('message', (data: { cells: number[][], timeLimit: number }) => {
    const result = solver.update(data.cells, data.timeLimit);
    parentPort!.postMessage(result);
  });
}
