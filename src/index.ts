import { BrowserManager } from "./browser/browser";
import { Solver } from "./solver/solver";

async function main() {
  const browserManager = new BrowserManager();
  await browserManager.launchAndGo();
  await browserManager.startGame();
  await browserManager.openPosition({ x: 10, y: 10 });
  
  const solver = new Solver(24, 20);
  let cells = await browserManager.getNumbers();
  let actions = solver.update(cells);
  while (actions.length !== 0) {
    await browserManager.openPositions(actions);
    cells = await browserManager.getNumbers();
    console.log(cells.map(row => row.join(' ')).join('\n'));
    actions = solver.update(cells);
    console.log(actions);
  }
  await browserManager.takeFinalScreenshot();
};

main();
