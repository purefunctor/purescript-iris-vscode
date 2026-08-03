import * as assert from "assert";

import { suite, test } from "mocha";

import {
  integrationTestContext,
  openWorkspaceDocument,
} from "../support/context";
import { markerPosition } from "../support/markers";
import { normalizeLocation } from "../support/normalize";
import { referencesAt } from "../support/providers";

suite("References", () => {
  test("finds exact references across modules", async () => {
    const context = await integrationTestContext();
    const document = await openWorkspaceDocument(context, "Main.purs");
    const references = await referencesAt(
      document,
      markerPosition(document, "shared-use"),
    );

    assert.deepStrictEqual(
      references
        .map(normalizeLocation)
        .sort((left, right) => left.path.localeCompare(right.path)),
      [
        { path: "src/Lib.purs", range: [6, 8, 6, 14] },
        { path: "src/Main.purs", range: [6, 18, 6, 24] },
      ],
    );
  });
});
