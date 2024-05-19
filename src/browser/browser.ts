import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import { AppConfig } from "../appconfig";
import fs from 'fs';
import { ISolver, Solver } from "../solver/solver";
import { SimpleSolver } from "../solver/simple-solver";

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

const openedCellsRbg = [
  [228, 196, 156],
  [216, 188, 156],
]

export type Coordinate = {
  readonly x: number,
  readonly y: number,
};

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export abstract class BrowserManager {
  private readonly width = 1440;
  private readonly height = 800;
  protected abstract readonly url: string;
  private readonly imageDirname = 'images';
  private browser: Browser | undefined = undefined;
  private page: Page | undefined = undefined;

  protected abstract readonly gameMode: GameMode;
  protected abstract readonly xMax: number;
  protected abstract readonly yMax: number;

  private count: number = 0;

  public async launchAndGo() {
    this.handleImagesFolder();

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

  /**
   * Deletes and creates the images folder, if `logImages` flag is turned on.
   * This is to clean logs from the previous session.
   */
  private handleImagesFolder(): void {
    if (!AppConfig.logImages) {
      return;
    }
    if (fs.existsSync(this.imageDirname)) {
      fs.rmSync(this.imageDirname, { recursive: true, force: true });
    }
    if (!fs.existsSync(this.imageDirname)) {
      fs.mkdirSync(this.imageDirname);
    }
  }

  public getSolver(): ISolver {
    switch (AppConfig.solverMode) {
      case 'complex':
        return new Solver(this.xMax, this.yMax);
      case 'simple':
        return new SimpleSolver(this.xMax, this.yMax);
      default:
        throw new Error(`Unrecognised solver mode: ${AppConfig.solverMode}`);
    }
  }

  protected getPage(): Page {
    return this.page as Page;
  }

  private getBrowser(): Browser {
    return this.browser as Browser;
  }

  public abstract startGame(): Promise<void>;

  protected abstract getNum(x: number, y: number): Promise<number>;

  public async getNumbers(): Promise<number[][]> {
    this.count++;
    if (AppConfig.logImages) {
      this.getPage().screenshot({
        path: `${this.imageDirname}/${this.count}.png`,
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

  public abstract openPosition(coordinate: Coordinate): Promise<void>;

  public async openPositions(coordinates: Coordinate[]): Promise<void> {
    return Promise.all(coordinates.map(coordinate => this.openPosition(coordinate))).then(() => {});
  }

  public async openInitial(): Promise<void> {
    await this.openPosition({ x: Math.floor(this.xMax / 2), y: Math.floor(this.yMax / 2) });
  }

  public async takeFinalScreenshot() {
    await sleep(AppConfig.screenshotWaitTime);
    await this.getPage().screenshot({
      path: `${this.imageDirname}/${AppConfig.screenshotName}.png`,
    });
  }

  public abstract isMine(coordinate: Coordinate): Promise<boolean>;

  public async close() {
    await this.getBrowser().close();
  }
}

export class GoogleBrowserManager extends BrowserManager {
  protected override readonly url = 'https://google.com/search?q=minesweeper';

  protected override readonly gameMode: GameMode;
  protected override readonly xMax: number;
  protected override readonly yMax: number;
  private readonly cellOffset = 1;
  private readonly cellWidth: number;
  private canvasPosition: Coordinate | undefined;
  private readonly canvasQuerySelector = 'canvas.ecwpfc';
  private readonly bombColorThreshold = 1000;

  constructor() {
    super();
    switch (AppConfig.gameMode) {
      case "easy":
        this.gameMode = GameMode.EASY;
        this.cellWidth = 45;
        this.xMax = 10;
        this.yMax = 8;
        break;
      case "medium":
        this.gameMode = GameMode.MEDIUM;
        this.cellWidth = 30;
        this.xMax = 18;
        this.yMax = 14;
        break;
      case "hard":
        this.gameMode = GameMode.HARD;
        this.cellWidth = 25;
        this.xMax = 24;
        this.yMax = 20;
        break;
      default:
        throw new Error(`Unrecognised game mode: "${AppConfig.gameMode}"`);
    }
  }

  public override async startGame(): Promise<void> {
    // Open the minefield
    await (await this.getPage().$('.fxvhbc') as ElementHandle<Element>).click();
    await sleep(100);

    // Mute
    await (await this.getPage().$('img.oO5WXb') as ElementHandle<Element>).click();

    // Select difficulty
    await (await this.getPage().$$('.CcNe6e'))[4].click();
    await sleep(100);
    await (await this.getPage().$(`.EpPYLd.GZnQqe.WtV5nd[data-difficulty=${GameMode[this.gameMode]}]`) as ElementHandle<Element>).click();
    await sleep(100);

    // Determine canvas position
    this.canvasPosition = await this.getPage().evaluate(`
      const rect = document.querySelector('${this.canvasQuerySelector}').getBoundingClientRect();
      result = { x: rect.x, y: rect.y };
      result`) as Coordinate;
  }

  private getCanvasPosition(): Coordinate {
    return this.canvasPosition as Coordinate;
  }

  protected override async getNum(x: number, y: number): Promise<number> {
    const imageData = await this.getPage().evaluate(
      `document.querySelector('${this.canvasQuerySelector}')
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
  }

  private distance(rbg1: Uint8ClampedArray, rbg2: number[]): number {
    return Math.sqrt((rbg1[0] - rbg2[0]) ** 2 + (rbg1[1] - rbg2[1]) ** 2 + (rbg1[2] - rbg2[2]) ** 2);
  }

  public override async openPosition(coordinate: Coordinate): Promise<void> {
    await this.getPage().mouse.click(
      this.getCanvasPosition().x + (coordinate.x + 0.5) * this.cellWidth,
      this.getCanvasPosition().y + (coordinate.y + 0.5) * this.cellWidth);
    await sleep(AppConfig.stepWaitTime);
    return;
  }

  public override async isMine(coordinate: Coordinate): Promise<boolean> {
    const imageData = await this.getPage().evaluate(`
      document.querySelector('${this.canvasQuerySelector}')
        .getContext("2d")
        .getImageData(${coordinate.x * this.cellWidth + 5}, ${coordinate.y * this.cellWidth + 5}, ${this.cellOffset}, ${this.cellOffset})`) as ImageData;
    const data = imageData.data;
    return this.distance(data, numberRgb[8]) > 30
      && this.distance(data, openedCellsRbg[0]) > 30
      && this.distance(data, openedCellsRbg[1]) > 30;
  }
}

export class MineOnlineBrowserManager extends BrowserManager {
  protected override readonly url = "https://minesweeperonline.com/";

  protected override readonly gameMode: GameMode;
  protected override readonly xMax: number;
  protected override readonly yMax: number;
  private readonly halfWidth = 8;

  constructor() {
    super();
    switch (AppConfig.gameMode) {
      case "easy":
        this.gameMode = GameMode.EASY;
        this.xMax = 9;
        this.yMax = 9;
        break;
      case "medium":
        this.gameMode = GameMode.MEDIUM;
        this.xMax = 16;
        this.yMax = 16;
        break;
      case "hard":
        this.gameMode = GameMode.HARD;
        this.xMax = 30;
        this.yMax = 16;
        break;
      default:
        throw new Error(`Unrecognised game mode: ${AppConfig.gameMode}`);
    }
  }

  public override async startGame(): Promise<void> {
    // Select difficulty
    let levelName: string;
    switch (this.gameMode) {
      case GameMode.EASY:
        levelName = 'beginner';
        break;
      case GameMode.MEDIUM:
        levelName = 'intermediate';
        break;
      case GameMode.HARD:
        levelName = 'expert';
        break;
    }
    await this.getPage().evaluate(`
      document.getElementById('${levelName}').click();
      document.querySelector('.dialogText').click();`);
  }

  public override async getNum(x: number, y: number): Promise<number> {
    const className = await this.getPage().evaluate(
      `document.getElementById('${y + 1}_${x + 1}').className;`) as string;
    const number = Number(className[className.length - 1]);
    if (isNaN(number)) {
      return 8;
    }
    return number;
  }

  public override async openPosition(coordinate: Coordinate): Promise<void> {
    const [x, y] = await this.getPage().evaluate(
      `rect = document.getElementById('${coordinate.y + 1}_${coordinate.x + 1}').getBoundingClientRect();
      [rect.x, rect.y];`) as [number, number];
    await this.getPage().mouse.click(x + this.halfWidth, y + this.halfWidth);
  }

  public override async isMine(coordinate: Coordinate): Promise<boolean> {
    return await this.getPage().evaluate(`
      document.getElementById('${coordinate.y + 1}_${coordinate.x + 1}')
      .classList.contains('bombdeath')`) as boolean;
  }
}

export class MineDotOnlineBrowserManager extends BrowserManager {
  protected override readonly url = "https://minesweeper.online/";

  protected override readonly gameMode: GameMode;
  protected override readonly xMax: number;
  protected override readonly yMax: number;
  private readonly halfWidth = 12;

  constructor() {
    super();
    switch (AppConfig.gameMode) {
      case "easy":
        this.gameMode = GameMode.EASY;
        this.xMax = 9;
        this.yMax = 9;
        break;
      case "medium":
        this.gameMode = GameMode.MEDIUM;
        this.xMax = 16;
        this.yMax = 16;
        break;
      case "hard":
        this.gameMode = GameMode.HARD;
        this.xMax = 30;
        this.yMax = 16;
        break;
      default:
        throw new Error(`Unrecognised game mode: ${AppConfig.gameMode}`);
    }
  }

  public override async startGame(): Promise<void> {
    let levelNumber: number;
    switch (this.gameMode) {
      case GameMode.EASY:
        levelNumber = 1;
        break;
      case GameMode.MEDIUM:
        levelNumber = 2;
        break;
      case GameMode.HARD:
        levelNumber = 3;
        break;
    }
    await this.getPage().evaluate(`
      document.querySelector('a.level${levelNumber}-link').click()`);
    await sleep(1000);
  }

  public override async getNum(x: number, y: number): Promise<number> {
    const className = await this.getPage().evaluate(
      `document.getElementById('cell_${x}_${y}').className;`) as string;
    const testNumber = Number(className.slice(className.length - 2));
    if (testNumber === 10 || testNumber === 11) {
      return 8;
    }
    const number = Number(className[className.length - 1]);
    if (isNaN(number)) {
      return 8;
    }
    return number;
  }

  public override async openPosition(coordinate: Coordinate): Promise<void> {
    const [x, y] = await this.getPage().evaluate(`
      rect = document.getElementById('cell_${coordinate.x}_${coordinate.y}').getBoundingClientRect();
      [rect.x, rect.y];`) as [number, number];
    await this.getPage().mouse.click(x + this.halfWidth, y + this.halfWidth);
  }

  public override async isMine(coordinate: Coordinate): Promise<boolean> {
    return await this.getPage().evaluate(`
      classList = document.getElementById('cell_${coordinate.x}_${coordinate.y}').classList;
      classList.contains('hd_type10') || classList.contains('hd_type11')`) as boolean;
  }
}
