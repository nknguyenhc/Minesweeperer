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
    expectArraysAreSame(solver.update(cells), expectedMoves);

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
    expectArraysAreSame(solver.update(cells), expectedMoves);
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

    expectArraysAreSame(solver.update(cells), expectedMoves);
  });
})
