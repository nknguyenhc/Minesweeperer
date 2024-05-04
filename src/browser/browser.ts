import puppeteer, { ElementHandle, Page } from "puppeteer";

export const launchAndGo = async () => {
  const width = 1440;
  const height = 800;
  const url = 'https://google.com/search?q=minesweeper';

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--window-size=${width},${height}`,
    ],
  });
  const page = await browser.newPage();

  await page.setViewport({ width, height });
  await page.goto(url);
  await page.waitForNetworkIdle();

  return { browser, page };
};

export enum GameMode {
  EASY,
  MEDIUM,
  HARD,
}

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const startGame = async (page: Page, gameMode: GameMode) => {
  // Open the minefield
  (await page.$('.fxvhbc') as ElementHandle<Element>).click();
  sleep(500);

  // Mute
  (await page.$('img.oO5WXb') as ElementHandle<Element>).click();

  // Select difficulty
  (await page.$$('.CcNe6e'))[4].click();
  sleep(100);
  (await page.$(`.EpPYLd.GZnQqe.WtV5nd[data-difficulty=${GameMode[gameMode]}]`) as ElementHandle<Element>).click();
}
