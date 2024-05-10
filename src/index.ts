import { AppConfig } from "./appconfig";
import { BrowserManager } from "./browser/browser";

async function main() {
  const browserManager = new BrowserManager();
  await browserManager.launchAndGo();
  await browserManager.startGame();
  await browserManager.openInitial();
  
  const solver = browserManager.getSolver();
  let cells = await browserManager.getNumbers();
  let actions = solver.update(cells);
  while (actions.length !== 0) {
    await browserManager.openPositions(actions);
    cells = await browserManager.getNumbers();
    if (AppConfig.logInfo) {
      console.log(cells.map(row => row.join(' ')).join('\n'));
    }
    actions = solver.update(cells);
    if (AppConfig.logInfo) {
      console.log(actions);
    }
  }
  if (AppConfig.saveScreenshot) {
    await browserManager.takeFinalScreenshot();
  }
  if (!AppConfig.keepAlive) {
    await browserManager.close();
  }
};

main();
