import assert from 'assert';
import { Coordinate } from '../browser/browser';

export class Solver {
  private cells: number[][];
  private readonly width: number;
  private readonly height: number;
  private knowledge: Sentence[] = [];
  private readonly mines: boolean[][];
  private safes: Set<number> = new Set();
  private readonly timeLimit = 1000;

  constructor(width: number, height: number) {
    this.cells = Array(height).fill(undefined).map(() => Array(width).fill(8));
    this.width = width;
    this.height = height;
    this.mines = Array(height).fill(undefined).map(() => Array(width).fill(false));
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
    const startTime = new Date().getTime();
    const oldCells = this.cells;
    this.cleanKnowledgeBase(cells);
    let newSentences: Sentence[] = this.createNewSentences(oldCells);
    let isNewKnowledgeAdded = true;
    while (isNewKnowledgeAdded || newSentences.length > 0) {
      if (new Date().getTime() - startTime > this.timeLimit) {
        break;
      }
      isNewKnowledgeAdded = this.addSentences(newSentences);
      let isKnowledgeAddedFromCleanup: boolean;
      [newSentences, isKnowledgeAddedFromCleanup] = this.cleanup();
      isNewKnowledgeAdded = isNewKnowledgeAdded || isKnowledgeAddedFromCleanup;
    }
    return this.getCellsToOpen();
  }

  private cleanKnowledgeBase(cells: number[][]): void {
    this.safes = new Set();
    const oldKnowledge = this.knowledge;
    this.knowledge = [];
    this.cells = cells;
    this.addSentences(oldKnowledge);
  }

  private cleanup(): [Sentence[], boolean] {
    const oldKnowledge = this.knowledge;
    this.knowledge = [];
    const isKnowledgeAdded = this.addSentences(oldKnowledge);
    return [this.forwardChain(), isKnowledgeAdded];
  }

  /**
   * Creates new sentences from the cells.
   * The cells are first compared with the current cells,
   * so that we only create sentences on new uncovered cells.
   * This routine is to be called to kickstart forward chaining.
   */
  private createNewSentences(oldCells: number[][]): Sentence[] {
    const newSentences: Sentence[] = [];
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (oldCells[i][j] !== 8) {
          assert(oldCells[i][j] === this.cells[i][j]);
          continue;
        }
        if (this.cells[i][j] === 8) {
          continue;
        }
        const newSentence = this.getCellSentence(i, j);
        if (!newSentence.isTrivial()) {
          newSentences.push(newSentence);
        }
      }
    }
    return newSentences;
  }

  /**
   * Get the sentence on the surrouding cells. Exclude cells with mines.
   * @param i The row index of the cell to calculate.
   * @param j The column index of the cell to calculate.
   * @returns First element is the set of free cells, second element is the count of mines.
   */
  private getCellSentence(i: number, j: number): Sentence {
    let count = this.cells[i][j];
    const positions: Set<number> = new Set();
    for (let ii = i - 1; ii <= i + 1; ii++) {
      for (let jj = j - 1; jj <= j + 1; jj++) {
        if (this.isCellFree(ii, jj)) {
          if (this.isSureMine(jj, ii)) {
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
    if (count < 0 || count > positions.size) {
      console.log("error detected!", i, j, count, this.cells[i][j], positions);
    }
    assert(count >= 0 && count <= positions.size);
    return Sentence.ofCount(positions, count);
  }

  /**
   * Returns whether the cell has not been opened.
   * False if the coordinates are invalid.
   * @param i X-coordinate of the cell.
   * @param j Y-coordinate of the cell.
   */
  public isCellFree(i: number, j: number): boolean {
    if (i < 0 || i >= this.height || j < 0 || j >= this.width) {
      return false;
    }
    return this.cells[i][j] === 8;
  }

  /**
   * Determines whether the position is for sure a mine.
   */
  public isSureMine(x: number, y: number): boolean {
    return this.mines[y][x];
  }

  /**
   * Determines whether the positionis for sure a safe position.
   */
  public isSureSafe(position: number): boolean {
    return this.safes.has(position);
  }

  /**
   * Adds the new sentences to the knowledge base.
   * Performs operations of pairs of sentences to generate next sentences
   * to be added to the knowledge base in the next iteration.
   * @param sentences Sentences to add to the knowledge base in this iteration.
   * @returns Sentences to add to the knowledge base in the next iteration.
   */
  private addSentences(sentences: Sentence[]): boolean {
    let isKnowledgeAdded = false;
    for (let sentenceToAdd of sentences) {
      let isReplaced = false;
      sentenceToAdd = sentenceToAdd.reduce(this);
      if (sentenceToAdd.isTrivial()) {
        continue;
      }
      isKnowledgeAdded = isKnowledgeAdded || this.updateSafesAndMinesFromSentence(sentenceToAdd);
      sentenceToAdd = sentenceToAdd.reduce(this);
      if (sentenceToAdd.isTrivial()) {
        continue;
      }

      for (let oldSentenceI = 0; oldSentenceI < this.knowledge.length; oldSentenceI++) {
        if (this.knowledge[oldSentenceI].isCompeting(sentenceToAdd)) {
          isReplaced = true;
          if (!sentenceToAdd.isSomethingNewWith(this.knowledge[oldSentenceI])) {
            break;
          }
          let newSentence = this.knowledge[oldSentenceI].combine(sentenceToAdd).reduce(this);
          isKnowledgeAdded = isKnowledgeAdded || this.updateSafesAndMinesFromSentence(newSentence);
          newSentence = newSentence.reduce(this);
          this.knowledge[oldSentenceI] = newSentence;
          break;
        }
      }
      if (!isReplaced) {
        this.knowledge.push(sentenceToAdd);
      }
    }
    return isKnowledgeAdded;
  }

  /**
   * Performs a forward chain to obtain new sentences.
   * New sentences must be useful in the knowledge base.
   */
  private forwardChain(): Sentence[] {
    const newSentences: Sentence[] = [];
    for (let i = 0; i < this.knowledge.length; i++) {
      for (let j = 0; j < this.knowledge.length; j++) {
        if (i === j) {
          continue;
        }
        const pairSentences = this.knowledge[i].newSentences(this.knowledge[j]);
        for (let newSentence of pairSentences) {
          newSentence = newSentence.reduce(this);
          if (newSentence.isTrivial()) {
            continue;
          }
          newSentences.push(newSentence);
        }
      }
    }
    return this.removeDuplicateSentences(newSentences);
  }

  /**
   * Returns a new list of sentences that are not present in the current knowledge base.
   */
  private removeDuplicateSentences(sentences: Sentence[]): Sentence[] {
    const newSentences: Sentence[] = [];
    for (const sentence of sentences) {
      let isDuplicate = false;
      for (const currentSentence of this.knowledge) {
        if (sentence.equals(currentSentence)) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        newSentences.push(sentence);
      }
    }
    return newSentences;
  }

  private updateSafesAndMinesFromSentence(sentence: Sentence): boolean {
    for (const position of sentence.getSureMines()) {
      const coord = this.numToCoord(position);
      this.mines[coord.y][coord.x] = true;
    }
    for (const position of sentence.getSureSafes()) {
      this.safes.add(position);
    }
    return sentence.getSureMines().size > 0 || sentence.getSureSafes().size > 0;
  } 

  /**
   * Returns the cells to open.
   * If there are safe cells, returns all safe cells.
   * If there are no safe cell, returns one random cell that is not surely a mine.
   */
  private getCellsToOpen(): Coordinate[] {
    if (this.safes.size > 0) {
      return Array.from(this.safes).map(position => this.numToCoord(position));
    } else if (!this.isGameFinished()) {
      return [this.randomCell()];
    } else {
      return [];
    }
  }

  /**
   * Determines whether the game has finished,
   * i.e. all cells are uncovered.
   */
  private isGameFinished(): boolean {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.cells[i][j] === 8 && !this.mines[i][j]) {
          return false;
        }
      }
    }
    return true;
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

    const index = Math.floor(Math.random() * count);
    count = 0;
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.cells[i][j] === 8 && !this.mines[i][j]) {
          if (count === index) {
            return {
              x: j,
              y: i,
            }
          }
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
    assert(lower >= 0);
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
    if (thisDifferencePositions.size === this.positions.size && sentenceDifferencePositions.size === sentence.positions.size) {
      return [];
    }

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
  public reduce(solver: Solver): Sentence {
    const positions: Set<number> = new Set();
    let lower = this.lower;
    let upper = this.upper;
    for (const position of this.positions) {
      const coordinate = solver.numToCoord(position);
      if (solver.isCellFree(coordinate.y, coordinate.x)) {
        if (solver.isSureMine(coordinate.x, coordinate.y)) {
          lower--;
          upper--;
        } else if (!solver.isSureSafe(position)) {
          positions.add(position);
        }
      }
    }
    lower = Math.max(lower, 0);
    upper = Math.min(upper, positions.size);
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

  /**
   * Determines if this sentence offers new insights to the given sentence,
   * given that these two sentences are combinable.
   */
  public isSomethingNewWith(sentence: Sentence): boolean {
    return this.lower > sentence.lower || this.upper < sentence.upper;
  }

  /**
   * Determines if two sentences are saying the exact same thing.
   */
  public equals(sentence: Sentence): boolean {
    const intersection = Sentence.positionIntersection(this.positions, sentence.positions);
    return intersection.size === this.positions.size && intersection.size === sentence.positions.size
      && this.lower === sentence.lower && this.upper === sentence.upper;
  }
}
