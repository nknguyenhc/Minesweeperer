import { AppConfig } from "./appconfig";
import { BrowserManager, GoogleBrowserManager, MineOnlineBrowserManager } from "./browser/browser";

async function main() {
  const browserManager: BrowserManager = pickManager();
  await browserManager.launchAndGo();
  await browserManager.startGame();
  await browserManager.openInitial();
  
  const solver = browserManager.getSolver();
  let cells = await browserManager.getNumbers();
  let [actions, watchOutForMine] = solver.update(cells);
  while (actions.length !== 0) {
    await browserManager.openPositions(actions);
    if (watchOutForMine && await browserManager.isMine(actions[0])) {
      console.log("Agent opened a mine cell");
      break;
    }
    cells = await browserManager.getNumbers();
    if (AppConfig.logInfo) {
      console.log(cells.map(row => row.join(' ')).join('\n'));
    }
    [actions, watchOutForMine] = solver.update(cells);
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

function pickManager(): BrowserManager {
  switch (AppConfig.site) {
    case "google":
      return new GoogleBrowserManager();
    case "minesweeperonline":
      return new MineOnlineBrowserManager();
    default:
      throw new Error(`Unrecognised site ${AppConfig.site}`);
  }
}

main();
