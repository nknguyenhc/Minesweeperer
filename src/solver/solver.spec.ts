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
    const cells = [
      [0, 1, 8, 8],
      [0, 1, 8, 8],
      [0, 2, 8, 8],
      [0, 1, 8, 8],
      [1, 2, 8, 8],
      [8, 8, 8, 8],
      [8, 8, 8, 8],
    ];

    const expectedMoves: Coordinate[] = [
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
  })
})
