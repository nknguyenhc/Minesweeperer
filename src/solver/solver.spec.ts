import { Solver } from "./solver";
import { describe, it } from "mocha";
import expect from "expect";
import { Coordinate } from "../browser/browser";

const expectArraysAreSame = (arr1: Coordinate[], arr2: Coordinate[]) => {
  console.log(arr1, arr2);
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
  })
})
