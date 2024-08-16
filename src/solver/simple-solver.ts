import { Coordinate, ISolver } from "./solver";
import assert from 'assert';

export class SimpleSolver extends ISolver {
  private cells: number[][];
  private readonly width: number;
  private readonly height: number;
  private readonly mines: boolean[][];
  private safes: Set<number> = new Set();
  private knowledge: Sentence[] = [];

  constructor(width: number, height: number) {
    super();
    this.cells = Array(height).fill(undefined).map(() => Array(width).fill(-1));
    this.width = width;
    this.height = height;
    this.mines = Array(height).fill(undefined).map(() => Array(width).fill(false));
  }

  private numToCoord(num: number): Coordinate {
    return {
      x: num % this.width,
      y: Math.floor(num / this.width),
    };
  }

  private coordToNum(coord: Coordinate): number {
    return coord.x + coord.y * this.width;
  }

  public isSureMine(cell: number): boolean {
    const coord = this.numToCoord(cell);
    return this.mines[coord.y][coord.x];
  }

  public isSureSafe(cell: number): boolean {
    const coord = this.numToCoord(cell);
    return this.safes.has(cell) || this.cells[coord.y][coord.x] !== -1;
  }

  public override update(cells: number[][], timeLimit?: number): [Coordinate[], boolean] {
    const oldCells = this.cells;
    this.cleanKnowledgeBase(cells);

    let newSentences: Sentence[] = this.createNewSentences(oldCells);
    let isNewKnowledgeAdded = true;
    while (isNewKnowledgeAdded) {
      isNewKnowledgeAdded = this.addSentences(newSentences);
      let isKnowledgeAddedFromCleanup: boolean;
      [newSentences, isKnowledgeAddedFromCleanup] = this.cleanup();
      isNewKnowledgeAdded ||= isKnowledgeAddedFromCleanup;
    }
    return this.getCellsToOpen();
  }

  /**
   * Resets the agent for a new update.
   * For each sentence, remove cells that are determined to be safe or mine.
   * Remove duplicate sentences.
   */
  private cleanKnowledgeBase(cells: number[][]): void {
    this.safes = new Set();
    const oldKnowledge = this.knowledge;
    this.knowledge = [];
    this.cells = cells;
    
    for (const sentence of oldKnowledge) {
      this.addSentence(sentence);
    }
  }

  /**
   * Add one sentence to the knowledge base.
   * @returns First element is whether new safe cells or mines are discovered.
   *          Second element is whether the sentence is new and is actually added.
   */
  private addSentence(sentence: Sentence): [boolean, boolean] {
    sentence.clean(this);
    const mines = sentence.getSureMines();
    if (mines !== undefined) {
      this.addMines(mines);
      return [true, false];
    }

    const safes = sentence.getSureSafes();
    if (safes !== undefined) {
      this.addSafes(safes);
      return [true, false];
    }

    if (this.containsSetence(sentence)) {
      return [false, false];
    }

    this.knowledge.push(sentence);
    return [false, true];
  }

  /**
   * Checks if the given sentence is already in the knowledge base.
   */
  private containsSetence(sentence: Sentence): boolean {
    for (const knowledgeSentence of this.knowledge) {
      if (knowledgeSentence.equals(sentence)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Creates new sentences by comparing the current cells to the old cells.
   * If there are new opened cells, create a sentence out of it.
   */
  private createNewSentences(oldCells: number[][]): Sentence[] {
    const newSentences: Sentence[] = [];
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (oldCells[i][j] !== -1) {
          if (oldCells[i][j] !== this.cells[i][j]) {
            console.log(`Wrong cell reading: ${i}, ${j}, ${oldCells[i][j]}, ${this.cells[i][j]}`);
          }
          assert(oldCells[i][j] === this.cells[i][j]);
          continue;
        }
        if (this.cells[i][j] === -1) {
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

  private getCellSentence(i: number, j: number): Sentence {
    let count = this.cells[i][j];
    const positions: Set<number> = new Set();
    for (let ii = i - 1; ii <= i + 1; ii++) {
      for (let jj = j - 1; jj <= j + 1; jj++) {
        if (ii === i && jj === j) {
          continue;
        }
        if (ii < 0 || ii >= this.height || jj < 0 || jj >= this.width) {
          continue;
        }
        const num = this.coordToNum({ x: jj, y: ii });
        if (this.isSureMine(num)) {
          count--;
        } else if (!this.isSureSafe(num)) {
          positions.add(num);
        }
      }
    }
    if (count < 0 || count > positions.size) {
      console.log("error detected!", i, j, count, this.cells[i][j], positions);
    }
    assert(count >= 0 && count <= positions.size);
    return new Sentence(positions, count);
  }

  /**
   * Adds new sentences to the knowledge base.
   * Inspects the new sentences and derive safe cells and mines.
   * Checks if the given cells
   * @returns Whether new safe cells or mines are derived, or new knowledge is added.
   */
  private addSentences(sentences: Sentence[]): boolean {
    let areNewSafesOrMinesDerived: boolean = false;
    let areNewSentencesAdded: boolean = false;
    for (const sentence of sentences) {
      const addResult = this.addSentence(sentence);
      areNewSafesOrMinesDerived ||= addResult[0];
      areNewSentencesAdded ||= addResult[1];
    }
    return areNewSafesOrMinesDerived || areNewSentencesAdded;
  }

  private addMines(mines: Set<number>): void {
    for (const mine of mines) {
      const coord = this.numToCoord(mine);
      this.mines[coord.y][coord.x] = true;
    }
  }

  private addSafes(safes: Set<number>): void {
    for (const safe of safes) {
      this.safes.add(safe);
    }
  }

  /**
   * Cleans up the knowledge base.
   * @returns First element is the new sentences to be added in the next iteration.
   *          Second element is whether new safe cells or mines are derived.
   */
  private cleanup(): [Sentence[], boolean] {
    let areNewSafesOrMinesDerived = false;
    const oldKnowledge = this.knowledge;
    this.knowledge = [];
    for (const sentence of oldKnowledge) {
      const addResult = this.addSentence(sentence);
      areNewSafesOrMinesDerived ||= addResult[0];
    }
    return [this.forwardChain(), areNewSafesOrMinesDerived];
  }

  /**
   * Executes a forward chain to generate new sentences for this knowledge base.
   */
  private forwardChain(): Sentence[] {
    const newSentences: Sentence[] = [];
    for (let i = 0; i < this.knowledge.length; i++) {
      for (let j = 0; j < this.knowledge.length; j++) {
        if (i === j) {
          continue;
        }
        const newSentence = this.knowledge[i].deduce(this.knowledge[j]);
        if (newSentence !== null) {
          newSentences.push(newSentence);
        }
      }
    }
    return newSentences;
  }

  /**
   * Returns the safe cells to be opened.
   * If there are no known safe cells, returns a random cell.
   * @returns First element is the list of cells.
   *          Second element is whether to watch out for mines.
   */
  private getCellsToOpen(): [Coordinate[], boolean] {
    if (this.safes.size > 0) {
      return [Array.from(this.safes).map(position => this.numToCoord(position)), false];
    } else if (!this.isGameFinished()) {
      return [[this.randomCell()], true];
    } else {
      return [[], false];
    }
  }

  /**
   * Determines whether the game has finished.
   * i.e. all cells are uncovered.
   */
  private isGameFinished(): boolean {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.cells[i][j] === -1 && !this.mines[i][j]) {
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
        if (this.cells[i][j] === -1 && !this.mines[i][j]) {
          count++;
        }
      }
    }

    const index = Math.floor(Math.random() * count);
    count = 0;
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.cells[i][j] === -1 && !this.mines[i][j]) {
          if (count === index) {
            return {
              x: j,
              y: i,
            };
          }
          count++;
        }
      }
    }
    assert(false);
  }
}

class Sentence {
  private readonly cells: Set<number>;
  private count: number;

  public constructor(cells: Set<number>, count: number) {
    assert(count <= cells.size);
    assert(count >= 0);
    this.cells = cells;
    this.count = count;
  }

  /**
   * Combines with a given sentence to produce a new sentence.
   * A new sentence is only produced if this sentence cells
   * are subset of the given sentence cells, or vice versa.
   * If the criterion is not met, return `null`.
   * @param sentence The sentence to combine.
   */
  public deduce(sentence: Sentence): Sentence | null {
    if (Sentence.isSubset(this.cells, sentence.cells)) {
      return new Sentence(Sentence.difference(sentence.cells, this.cells), sentence.count - this.count);
    }
    if (Sentence.isSubset(sentence.cells, this.cells)) {
      return new Sentence(Sentence.difference(this.cells, sentence.cells), this.count - sentence.count);
    }
    return null;
  }

  /**
   * Determines if `subset` is a subset of `set`.
   */
  private static isSubset(subset: Set<number>, set: Set<number>): boolean {
    for (const num of subset) {
      if (!set.has(num)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Determines the set of items that are in `a` but not in `b`.
   */
  private static difference(a: Set<number>, b: Set<number>): Set<number> {
    const result: Set<number> = new Set();
    for (const num of a) {
      if (!b.has(num)) {
        result.add(num);
      }
    }
    return result;
  }

  /**
   * Mutates this sentence according to the solver.
   * Remove cells from this sentence that are already determined to be save or mine.
   */
  public clean(solver: SimpleSolver): void {
    const cells = Array.from(this.cells);
    for (const cell of cells) {
      if (solver.isSureMine(cell)) {
        this.cells.delete(cell);
        this.count -= 1;
      } else if (solver.isSureSafe(cell)) {
        this.cells.delete(cell);
      }
    }
  }

  /**
   * Get the set of cells that are sure mines from this sentence.
   */
  public getSureMines(): Set<number> | undefined {
    if (this.cells.size === this.count) {
      return this.cells;
    } else {
      return undefined;
    }
  }

  /**
   * Get the set of cells that are sure safe cells from this sentence.
   */
  public getSureSafes(): Set<number> | undefined {
    if (this.count === 0) {
      return this.cells;
    } else {
      return undefined;
    }
  }

  /**
   * Determines if two sentences are equal.
   * They are equal if they describe the same set of cells.
   */
  public equals(sentence: Sentence): boolean {
    return Sentence.isSubset(this.cells, sentence.cells)
        && Sentence.isSubset(sentence.cells, this.cells);
  }

  /**
   * Determines if this sentence can be derived regardless of context.
   * True if this sentence does not contain any cell.
   */
  public isTrivial(): boolean {
    return this.cells.size === 0;
  }
}
