import { Solver } from "./solver";
import { describe, it } from "mocha";
import expect from "expect";
import { Coordinate } from "../browser/browser";

const expectArraysAreSame = (arr1: Coordinate[], arr2: Coordinate[]) => {
  if (arr1.length !== arr2.length) {
    expect(true).toBe(false);
  }
  for (const elem of arr1) {
    expect(arr2).toContainEqual(elem);
  }
  for (const elem of arr2) {
    expect(arr1).toContainEqual(elem);
  }
}

describe("Solver", () => {
  it("Initial board with counts 1, 2", () => {
    const solver = new Solver(4, 7);
    let cells = [
      [0, 1, 8, 8],
      [0, 1, 8, 8],
      [0, 2, 8, 8],
      [0, 1, 8, 8],
      [1, 2, 8, 8],
      [8, 8, 8, 8],
      [8, 8, 8, 8],
    ];

    let expectedMoves: Coordinate[] = [
      {
        x: 2,
        y: 0,
      },
      {
        x: 2,
        y: 2,
      },
      {
        x: 2,
        y: 4,
      },
      {
        x: 2,
        y: 5,
      },
    ];
    expectArraysAreSame(solver.update(cells)[0], expectedMoves);

    cells = [
      [0, 1, 2, 8],
      [0, 1, 8, 8],
      [0, 2, 4, 8],
      [0, 1, 8, 8],
      [1, 2, 1, 8],
      [8, 8, 2, 8],
      [8, 8, 8, 8],
    ];

    expectedMoves = [
      {
        x: 3,
        y: 0,
      },
      {
        x: 3,
        y: 3,
      },
      {
        x: 3,
        y: 4,
      },
      {
        x: 1,
        y: 5,
      },
      {
        x: 3,
        y: 5,
      },
    ];
    expectArraysAreSame(solver.update(cells)[0], expectedMoves);
  });

  it("Initial board with counts 1, 2, 3", () => {
    const solver = new Solver(16, 16);
    let cells: number[][] = [
      [8, 8, 8, 8, 1, 0, 1, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 1, 0, 1, 1, 3, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 2, 0, 0, 0, 1, 1, 1, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 2, 0, 0, 0, 0, 0, 1, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 2, 0, 0, 1, 2, 2, 3, 8, 8, 8, 8, 8],
      [8, 2, 1, 1, 1, 0, 0, 1, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 1, 0, 0, 0, 0, 0, 1, 2, 3, 8, 8, 8, 8, 8, 8],
      [8, 1, 0, 0, 0, 0, 0, 0, 0, 1, 8, 8, 8, 8, 8, 8],
      [8, 2, 2, 1, 1, 1, 1, 1, 1, 1, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    ];

    let expectedMoves: Coordinate[] = [
      {
        x: 3,
        y: 0,
      },
      {
        x: 3,
        y: 2,
      },
      {
        x: 2,
        y: 4,
      },
      {
        x: 1,
        y: 4,
      },
      {
        x: 0,
        y: 7,
      },
      {
        x: 4,
        y: 9,
      },
      {
        x: 7,
        y: 9,
      },
      {
        x: 10,
        y: 9,
      },
      {
        x: 10,
        y: 8,
      },
      {
        x: 10,
        y: 7,
      },
      {
        x: 10,
        y: 5,
      },
      {
        x: 10,
        y: 1,
      },
      {
        x: 11,
        y: 1,
      },
      {
        x: 11,
        y: 2,
      },
      {
        x: 11,
        y: 3,
      },
      {
        x: 8,
        y: 0,
      },
    ];

    expectArraysAreSame(solver.update(cells)[0], expectedMoves);
  });

  it("Initial board with counts 1, 2, 3, 4", () => {
    const solver = new Solver(16, 16);
    let cells: number[][] = [
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 3, 1, 2, 1, 2, 8, 8, 8, 8, 8, 8],
      [8, 8, 1, 2, 2, 1, 0, 0, 0, 1, 8, 8, 8, 8, 8, 8],
      [8, 8, 1, 0, 0, 0, 0, 0, 0, 1, 4, 8, 8, 8, 8, 8],
      [8, 8, 1, 0, 0, 0, 1, 1, 1, 0, 2, 8, 8, 8, 8, 8],
      [8, 8, 1, 0, 0, 0, 1, 8, 1, 0, 2, 8, 8, 8, 8, 8],
      [8, 8, 2, 3, 2, 1, 1, 8, 2, 2, 3, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    ];

    let expectedMoves: Coordinate[] = [
      {
        x: 2,
        y: 5,
      },
      {
        x: 1,
        y: 5,
      },
      {
        x: 1,
        y: 6,
      },
      {
        x: 1,
        y: 7,
      },
      {
        x: 1,
        y: 9,
      },
      {
        x: 1,
        y: 10,
      },
      {
        x: 1,
        y: 11,
      },
      {
        x: 5,
        y: 11,
      },
      {
        x: 6,
        y: 11,
      },
      {
        x: 7,
        y: 11,
      },
      {
        x: 7,
        y: 10,
      },
      {
        x: 11,
        y: 9,
      },
      {
        x: 10,
        y: 5,
      },
      {
        x: 10,
        y: 4,
      },
      {
        x: 9,
        y: 4,
      },
      {
        x: 7,
        y: 4,
      },
      {
        x: 5,
        y: 4,
      },
    ];

    expectArraysAreSame(solver.update(cells)[0], expectedMoves);

    cells = [
      [1, 2, 8, 1, 1, 1, 1, 0, 0, 1, 8, 8, 8, 8, 8, 8],
      [1, 8, 2, 2, 2, 8, 1, 1, 1, 2, 8, 8, 8, 8, 8, 8],
      [1, 1, 1, 1, 8, 2, 1, 1, 8, 8, 8, 8, 8, 8, 8, 8],
      [0, 1, 2, 4, 3, 3, 1, 3, 3, 8, 8, 8, 8, 8, 8, 8],
      [0, 1, 8, 8, 8, 3, 8, 2, 8, 2, 3, 8, 8, 8, 8, 8],
      [1, 2, 3, 8, 8, 3, 1, 2, 1, 2, 4, 8, 8, 8, 8, 8],
      [8, 1, 1, 2, 2, 1, 0, 0, 0, 1, 8, 8, 8, 8, 8, 8],
      [2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 4, 8, 8, 8, 8, 8],
      [1, 8, 1, 0, 0, 0, 1, 1, 1, 0, 2, 8, 8, 8, 8, 8],
      [1, 1, 1, 0, 0, 0, 1, 8, 1, 0, 2, 4, 8, 8, 8, 8],
      [1, 2, 2, 3, 2, 1, 1, 2, 2, 2, 3, 8, 8, 8, 8, 8],
      [8, 2, 8, 8, 8, 1, 1, 3, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    ];

    expectedMoves = [
      {
        x: 9,
        y: 2,
      },
      {
        x: 10,
        y: 2,
      },
      {
        x: 10,
        y: 3,
      },
      {
        x: 11,
        y: 3,
      },
      {
        x: 9,
        y: 11,
      },
      {
        x: 6,
        y: 12,
      },
      {
        x: 5,
        y: 12,
      },
      {
        x: 4,
        y: 12,
      },
      {
        x: 2,
        y: 12,
      },
      {
        x: 1,
        y: 12,
      },
      {
        x: 0,
        y: 12,
      },
    ];

    expectArraysAreSame(solver.update(cells)[0], expectedMoves);
  });

  it("Should not uncover cell with mine when stuck", () => {
    const cells: () => number[][] = () => [
      [8, 1, 0],
      [8, 4, 2],
      [8, 8, 8],
    ];
    const mines: Coordinate[] = [
      {
        x: 0,
        y: 3,
      },
      {
        x: 1,
        y: 3,
      },
      {
        x: 2,
        y: 3,
      },
    ];

    for (let i = 0; i < 100; i++) {
      const solver = new Solver(3, 3);
      const moves = solver.update(cells());
      expect(moves).toHaveLength(1);
      expect(mines).not.toContain(moves[0]);
    }
  });

  it("Should return empty action array when game finishes", () => {
    const cells = [
      [8, 1, 0],
      [3, 4, 2],
      [8, 8, 8],
    ];

    const solver = new Solver(3, 3);
    expect(solver.update(cells)).toEqual([]);
  });
});
