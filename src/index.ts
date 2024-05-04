import { GameMode, launchAndGo, startGame } from "./browser/browser";

async function main() {
  const {browser, page} = await launchAndGo();
  startGame(page, GameMode.HARD);
};

main();
