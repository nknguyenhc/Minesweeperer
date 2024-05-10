import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import { AppConfig } from "../appconfig";

enum GameMode {
  EASY,
  MEDIUM,
  HARD,
};

// Approximate colours only
const numberRgb = [
  [232, 196, 156], // 0
  [19, 117, 209], // 1
  [55, 140, 60], // 2
  [211, 49, 46], // 3
  [120, 26, 162], // 4
  [245, 151, 27], // 5
  [27, 153, 163], // 6
  [98, 88, 80], // 7
  [176, 212, 84], // not opened
];

export type Coordinate = {
  x: number,
  y: number,
};

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export class BrowserManager {
  private readonly width = 1440;
  private readonly height = 800;
  private readonly url = 'https://google.com/search?q=minesweeper';
  private browser: Browser | undefined = undefined;
  private page: Page | undefined = undefined;

  private readonly gameMode: GameMode = GameMode.HARD;
  private readonly cellOffset = 1;
  private readonly cellWidth = 25;
  private readonly xMax = 24;
  private readonly yMax = 20;
  private canvasPosition: Coordinate | undefined;

  private count: number = 0;

  public async launchAndGo() {
    this.browser = await puppeteer.launch({
      headless: !AppConfig.liveBrowser,
      args: [
        `--window-size=${this.width},${this.height}`,
      ],
      defaultViewport: null,
    });
    this.page = await this.browser.newPage();

    await this.page.goto(this.url);
    await this.page.waitForNetworkIdle();
  };

  private getPage(): Page {
    return this.page as Page;
  }

  private getBrowser(): Browser {
    return this.browser as Browser;
  }

  private getCanvasPosition(): Coordinate {
    return this.canvasPosition as Coordinate;
  }

  public async startGame() {
    // Open the minefield
    await (await this.getPage().$('.fxvhbc') as ElementHandle<Element>).click();

    // Mute
    await (await this.getPage().$('img.oO5WXb') as ElementHandle<Element>).click();

    // Select difficulty
    await (await this.getPage().$$('.CcNe6e'))[4].click();
    await (await this.getPage().$(`.EpPYLd.GZnQqe.WtV5nd[data-difficulty=${GameMode[this.gameMode]}]`) as ElementHandle<Element>).click();
    await sleep(100);

    // Determine canvas position
    this.canvasPosition = await this.getPage().evaluate(`
      const rect = document.querySelector('canvas.ecwpfc').getBoundingClientRect();
      result = { x: rect.x, y: rect.y };
      result`) as Coordinate;
  };

  private async getNum(x: number, y: number): Promise<number> {
    const imageData = await this.getPage().evaluate(
      `document.querySelector('canvas.ecwpfc')
        .getContext('2d')
        .getImageData(${(x + 0.5) * this.cellWidth + 1}, ${(y + 0.5) * this.cellWidth}, ${this.cellOffset}, ${this.cellOffset})`) as ImageData;
    const data = imageData.data;

    let number: number = 0;
    let smallestDistance: number = 3 * 255 ** 2;
    for (let i = 0; i <= 8; i++) {
      const newDistance = this.distance(data, numberRgb[i]);
      if (newDistance < smallestDistance) {
        smallestDistance = newDistance;
        number = i;
      }
    }
    return number;
  };

  private distance(rbg1: Uint8ClampedArray, rbg2: number[]): number {
    return Math.sqrt((rbg1[0] - rbg2[0]) ** 2 + (rbg1[1] - rbg2[1]) ** 2 + (rbg1[2] - rbg2[2]) ** 2);
  }

  public async getNumbers(): Promise<number[][]> {
    this.count++;
    if (AppConfig.logImages) {
      this.getPage().screenshot({
        path: `images/${this.count}.png`,
      });
    }

    const numbers: number[][] = [];
    for (let y = 0; y < this.yMax; y++) {
      const row: number[] = [];
      for (let x = 0; x < this.xMax; x++) {
        row.push(await this.getNum(x, y));
      }
      numbers.push(row);
    }
    return numbers;
  }

  public async openPosition(coordinate: Coordinate): Promise<void> {
    await this.getPage().mouse.click(
      this.getCanvasPosition().x + (coordinate.x + 0.5) * this.cellWidth,
      this.getCanvasPosition().y + (coordinate.y + 0.5) * this.cellWidth);
    await sleep(AppConfig.stepWaitTime);
    return;
  }

  public async openPositions(coordinates: Coordinate[]): Promise<void> {
    return Promise.all(coordinates.map(coordinate => this.openPosition(coordinate))).then(() => {});
  }

  public async takeFinalScreenshot() {
    await sleep(5000);
    await this.getPage().screenshot({
      path: `images/${AppConfig.screenshotName}.png`,
    });
  }

  public async close() {
    await this.getBrowser().close();
  }
}
