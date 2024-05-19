import { describe, it } from "mocha";
import { SimpleSolver } from "./simple-solver";
import { Coordinate } from "../browser/browser";
import { expectArraysAreSame } from "./solver.spec";

describe("SimpleSolver", () => {
  it("Initial board with counts 1, 2, 3", () => {
    const solver = new SimpleSolver(13, 13);
    let cells = [
      [8, 8, 8, 8, 1, 0, 1, 8, 8, 8, 8, 8, 8],
      [8, 8, 2, 1, 1, 0, 2, 8, 8, 8, 8, 8, 8],
      [8, 8, 1, 0, 0, 0, 3, 8, 8, 8, 8, 8, 8],
      [8, 8, 1, 0, 0, 0, 2, 8, 8, 8, 8, 8, 8],
      [8, 8, 1, 1, 0, 0, 1, 2, 2, 8, 8, 8, 8],
      [8, 8, 8, 2, 0, 0, 0, 0, 1, 8, 8, 8, 8],
      [8, 8, 8, 3, 1, 0, 0, 0, 1, 8, 8, 8, 8],
      [8, 8, 8, 8, 1, 0, 0, 0, 1, 2, 8, 8, 8],
      [8, 8, 8, 8, 2, 1, 0, 0, 0, 2, 8, 8, 8],
      [8, 8, 8, 8, 8, 1, 1, 1, 1, 2, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    ];

    let expectedMoves: Coordinate[] = [
      {
        x: 2,
        y: 0,
      },
      {
        x: 1,
        y: 0,
      },
      {
        x: 1,
        y: 1,
      },
      {
        x: 1,
        y: 3,
      },
      {
        x: 1,
        y: 4,
      },
      {
        x: 1,
        y: 5,
      },
      {
        x: 2,
        y: 7,
      },
      {
        x: 3,
        y: 8,
      },
      {
        x: 3,
        y: 9,
      },
      {
        x: 4,
        y: 10,
      },
      {
        x: 5,
        y: 10,
      },
      {
        x: 6,
        y: 10,
      },
      {
        x: 8,
        y: 10,
      },
      {
        x: 9,
        y: 10,
      },
      {
        x: 9,
        y: 5,
      },
      {
        x: 9,
        y: 4,
      },
      {
        x: 9,
        y: 3,
      },
      {
        x: 7,
        y: 0,
      },
    ];

    expectArraysAreSame(solver.update(cells)[0], expectedMoves);
  });
});
