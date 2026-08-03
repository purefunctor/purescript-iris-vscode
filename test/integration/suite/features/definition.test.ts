import * as assert from "assert";

import { suite, test } from "mocha";

import {
  integrationTestContext,
  openWorkspaceDocument,
} from "../support/context";
import { markerPosition } from "../support/markers";
import { normalizeLocation } from "../support/normalize";
import { definitionsAt } from "../support/providers";

suite("Definition", () => {
  test("navigates from an imported use to its declaration", async () => {
    const context = await integrationTestContext();
    const document = await openWorkspaceDocument(context, "Main.purs");
    const definitions = await definitionsAt(
      document,
      markerPosition(document, "shared-use"),
    );

    assert.deepStrictEqual(definitions.map(normalizeLocation), [
      { path: "src/Lib.purs", range: [2, 0, 4, 11] },
    ]);
  });
});
