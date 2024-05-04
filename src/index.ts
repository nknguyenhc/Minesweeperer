import { BrowserManager } from "./browser/browser";

async function main() {
  const browserManger = new BrowserManager();
  await browserManger.launchAndGo();
  await browserManger.startGame();
  await browserManger.openPosition(1, 1);
  console.log(await browserManger.getNumbers());
};

main();
