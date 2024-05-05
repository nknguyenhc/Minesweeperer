import assert from 'assert';
import { Coordinate } from '../browser/browser';

export class Solver {
  private readonly cells: number[][];
  private readonly width: number;
  private readonly height: number;
  private knowledge: Sentence[] = [];
  private readonly mines: boolean[][];

  constructor(width: number, height: number) {
    this.cells = Array(height).fill(Array(width).fill(8));
    this.width = width;
    this.height = height;
    this.mines = Array(height).fill(Array(width).fill(false));
  }

  public numToCoord(num: number): Coordinate {
    return {
      x: num % this.width,
      y: Math.floor(num / this.width),
    };
  }

  public coordToNum(coord: Coordinate): number {
    return coord.x + coord.y * this.width;
  }

  /**
   * Updates the knowledge base with the new board.
   * @param cells The new board.
   * @returns The cells that can be uncovered next.
   */
  public update(cells: number[][]): Coordinate[] {
    this.cleanKnowledgeBase(cells);
    let newSentences: Sentence[] = this.createNewSentences(cells);
    while (newSentences.length !== 0) {
      newSentences = this.addSentences(newSentences);
    }
    this.updateMines();
    return this.getCellsToOpen();
  }

  private cleanKnowledgeBase(cells: number[][]): void {
    const newKnowledge: Sentence[] = [];
    for (const sentence of this.knowledge) {
      const newSentence = sentence.reduce(cells, this);
      if (!newSentence.isTrivial()) {
        newKnowledge.push(newSentence);
      }
    }
    this.knowledge = newKnowledge;
  }

  private createNewSentences(cells: number[][]): Sentence[] {
    const newSentences: Sentence[] = [];
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.cells[i][j] !== 8) {
          assert(this.cells[i][j] === cells[i][j]);
          continue;
        }
        if (cells[i][j] === 8) {
          continue;
        }
        const newSentence = this.getCellSentence(cells, i, j);
        if (!newSentence.isTrivial()) {
          newSentences.push(newSentence);
        }
      }
    }
    return newSentences;
  }

  /**
   * Get the sentence on the surrouding cells. Exclude cells with mines.
   * @param cells The board of cells.
   * @param i The row index of the cell to calculate.
   * @param j The column index of the cell to calculate.
   * @returns First element is the set of free cells, second element is the count of mines.
   */
  private getCellSentence(cells: number[][], i: number, j: number): Sentence {
    let count = cells[i][j];
    const positions: Set<number> = new Set();
    for (let ii = i - 1; ii <= i + 1; ii++) {
      for (let jj = j - 1; jj <= j + 1; jj++) {
        if (this.isCellFree(cells, ii, jj)) {
          if (this.isSureMine(ii, jj)) {
            count--;
          } else {
            positions.add(this.coordToNum({
              x: jj,
              y: ii,
            }));
          }
        }
      }
    }
    return Sentence.ofCount(positions, count);
  }

  /**
   * Returns whether the cell has not been opened.
   * False if the coordinates are invalid.
   * @param cells The board to look up the cell.
   * @param i X-coordinate of the cell.
   * @param j Y-coordinate of the cell.
   */
  private isCellFree(cells: number[][], i: number, j: number): boolean {
    if (i < 0 || i >= this.height || j < 0 || j >= this.width) {
      return false;
    }
    return cells[i][j] === 8;
  }

  /**
   * Determines whether the position is for sure a mine.
   */
  public isSureMine(x: number, y: number): boolean {
    return this.mines[y][x];
  }

  /**
   * Adds the new sentences to the knowledge base.
   * Performs operations of pairs of sentences to generate next sentences
   * to be added to the knowledge base in the next iteration.
   * @param sentences Sentences to add to the knowledge base in this iteration.
   * @returns Sentences to add to the knowledge base in the next iteration.
   */
  private addSentences(sentences: Sentence[]): Sentence[] {
    for (let sentenceToAddI = 0; sentenceToAddI < sentences.length; sentenceToAddI++) {
      let isReplaced = false;
      for (let oldSentenceI = 0; oldSentenceI < this.knowledge.length; oldSentenceI++) {
        if (this.knowledge[oldSentenceI].isCompeting(sentences[sentenceToAddI])) {
          this.knowledge[oldSentenceI] = this.knowledge[oldSentenceI].combine(sentences[sentenceToAddI]);
          isReplaced = true;
          break;
        }
      }
      if (!isReplaced) {
        this.knowledge.push(sentences[sentenceToAddI]);
      }
    }
    return this.forwardChain(sentences);
  }

  /**
   * Performs a forward chain to obtain new sentences.
   * Assuming that the given sentences are already added to the knowledge base.
   * @param sentences P
   * @returns 
   */
  private forwardChain(sentences: Sentence[]): Sentence[] {
    const newSentences: Sentence[] = [];
    for (const newSentence of sentences) {
      for (const sentence of this.knowledge) {
        const pairSentences = newSentence.newSentences(sentence);
        newSentences.push(...pairSentences);
      }
    }
    return newSentences;
  }

  /**
   * Updates the mine map based on the current sentences in the knowledge base.
   */
  private updateMines(): void {
    for (const sentence of this.knowledge) {
      const sureMines: Set<number> = sentence.getSureMines();
      for (const position of sureMines) {
        const coordinates = this.numToCoord(position);
        this.mines[coordinates.y][coordinates.x] = true;
      }
    }
  }

  /**
   * Returns the cells to open.
   * If there are safe cells, returns all safe cells.
   * If there are no safe cell, returns one random cell that is not surely a mine.
   */
  private getCellsToOpen(): Coordinate[] {
    const cells: Coordinate[] = [];
    for (const sentence of this.knowledge) {
      const sureSafes: Set<number> = sentence.getSureSafes();
      for (const position of sureSafes) {
        cells.push(this.numToCoord(position));
      }
    }

    if (cells.length === 0) {
      return [this.randomCell()];
    } else {
      return cells;
    }
  }

  /**
   * Returns a random cell that is not sure to be a mine.
   */
  private randomCell(): Coordinate {
    let count = 0;
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.cells[i][j] === 8 && !this.mines[i][j]) {
          count++;
        }
      }
    }

    const index = Math.random() * count;
    count = 0;
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (count === index) {
          return {
            x: j,
            y: i,
          }
        }
        if (this.cells[i][j] === 8 && !this.mines[i][j]) {
          count++;
        }
      }
    }

    assert(false);
  }
}

class Sentence {
  private readonly positions: Set<number>;
  private readonly lower: number;
  private readonly upper: number;

  private constructor(positions: Set<number>, lower: number, upper: number) {
    assert(lower <= upper);
    assert(upper <= positions.size);
    this.positions = positions;
    this.lower = lower;
    this.upper = upper;
  }

  public static ofCount(positions: Set<number>, count: number): Sentence {
    return new Sentence(positions, count, count);
  }

  /**
   * Returns the sentence that defines the difference bewtween this sentence and the given sentence.
   * @param sentence The sentence to compare.
   * @param thisDifferencePositions The positions in this sentence and not in the given sentence.
   * @param sentenceDifferencePositions The positions in the given sentence and not in this sentence.
   */
  private subtract(sentence: Sentence, thisDifferencePositions: Set<number>, sentenceDifferencePositions: Set<number>): Sentence {
    const lower = Math.max(this.lower - sentence.upper, 0);
    const upper = Math.min(
      this.upper - Math.max(sentence.lower - sentenceDifferencePositions.size, 0),
      thisDifferencePositions.size);
    return new Sentence(thisDifferencePositions, lower, upper);
  }

  /**
   * Deduce the sentence that represents the intersection of this sentence and a given sentence.
   * @param sentence The sentence to calculate the intersection with.
   * @param thisDifference The result of `this.subtract(sentence)`.
   * @param sentenceDifference The result of `sentence.subtract(this)`.
   */
  private intersection(sentence: Sentence, thisDifference: Sentence, sentenceDifference: Sentence): Sentence {
    const positions = Sentence.positionIntersection(this.positions, sentence.positions);
    const lower = Math.max(this.lower - thisDifference.upper, sentence.lower - sentenceDifference.upper, 0);
    const upper = Math.min(this.upper - thisDifference.lower, sentence.upper - sentenceDifference.lower, positions.size);
    return new Sentence(positions, lower, upper);
  }

  /**
   * Determines the set of positions that are in `a` but not in `b`.
   */
  private static positionDifference(a: Set<number>, b: Set<number>): Set<number> {
    const positions: Set<number> = new Set();
    for (const position of a) {
      if (!b.has(position)) {
        positions.add(position);
      }
    }
    return positions;
  }

  /**
   * Determines the set of positions that are both in `a` and `b`.
   */
  private static positionIntersection(a: Set<number>, b: Set<number>): Set<number> {
    const positions: Set<number> = new Set();
    for (const position of a) {
      if (b.has(position)) {
        positions.add(position);
      }
    }
    return positions;
  }

  /**
   * Returns new sentences to be added to the knowledge base.
   * The sentences generated are non-trivial, but the knowledge base must check for duplicates/superior statements.
   * @param sentence The sentence to combine to produce new sentences.
   */
  public newSentences(sentence: Sentence): Sentence[] {
    const thisDifferencePositions = Sentence.positionDifference(this.positions, sentence.positions);
    const sentenceDifferencePositions = Sentence.positionDifference(sentence.positions, this.positions);

    const thisDifference = this.subtract(sentence, thisDifferencePositions, sentenceDifferencePositions);
    const sentenceDifference = sentence.subtract(this, sentenceDifferencePositions, thisDifferencePositions);
    const intersection = this.intersection(sentence, thisDifference, sentenceDifference);

    const result: Sentence[] = [];
    if (!thisDifference.isTrivial()) {
      result.push(thisDifference);
    }
    if (!sentenceDifference.isTrivial()) {
      result.push(sentenceDifference);
    }
    if (!intersection.isTrivial()) {
      result.push(intersection);
    }
    return result;
  }

  /**
   * Determines if this sentence is obvious, can be derived without any prior knowledge base.
   * To determine whether to add this sentence to a knowledge base.
   */
  public isTrivial(): boolean {
    return this.lower === 0 && this.upper === this.positions.size;
  }

  /**
   * Determines if this sentence and the given sentence can be combined in the knowledge base.
   */
  public isCompeting(sentence: Sentence): boolean {
    for (const position of this.positions) {
      if (!sentence.positions.has(position)) {
        return false;
      }
    }
    return this.positions.size === sentence.positions.size;
  }

  /**
   * Combines this sentence and the given sentence, assuming that the two sentences are combinable.
   */
  public combine(sentence: Sentence): Sentence {
    const lower = Math.max(this.lower, sentence.lower);
    const upper = Math.min(this.upper, sentence.upper);
    return new Sentence(this.positions, lower, upper);
  }

  /**
   * Reduce the current sentence to fit the new board.
   * This involves removing new cells discovered from the set of cells in this sentence.
   * @param cells The new board.
   * @param solver The agent to reduce for.
   * @returns The new reduced sentence.
   */
  public reduce(cells: number[][], solver: Solver): Sentence {
    const positions: Set<number> = new Set();
    let lower = this.lower;
    let upper = this.upper;
    for (const position of this.positions) {
      const coordinate = solver.numToCoord(position);
      if (cells[coordinate.y][coordinate.x] === 8) {
        if (solver.isSureMine(coordinate.x, coordinate.y)) {
          lower--;
          upper--;
        } else {
          positions.add(position);
        }
      }
    }
    return new Sentence(positions, lower, upper);
  }

  /**
   * Returns the positions that are sure to be mines, from this sentence.
   */
  public getSureMines(): Set<number> {
    if (this.lower === this.positions.size) {
      return this.positions;
    } else {
      return new Set();
    }
  }

  /**
   * Returns the positions that are sure to be safe, from this sentences.
   */
  public getSureSafes(): Set<number> {
    if (this.upper === 0) {
      return this.positions;
    } else {
      return new Set();
    }
  }
}
