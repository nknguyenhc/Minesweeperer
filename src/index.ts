import { BrowserManager } from "./browser/browser";
import { Solver } from "./solver/solver";

async function main() {
  const browserManger = new BrowserManager();
  await browserManger.launchAndGo();
  await browserManger.startGame();
  await browserManger.openPosition({ x: 10, y: 10 });
  
  const solver = new Solver(24, 20);
  let cells = await browserManger.getNumbers();
  let actions = solver.update(cells);
  while (actions.length !== 0) {
    await browserManger.openPositions(actions);
    cells = await browserManger.getNumbers()
    actions = solver.update(cells);
  }
};

main();
