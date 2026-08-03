import * as assert from "assert";

import { suite, test } from "mocha";

import {
  integrationTestContext,
  openWorkspaceDocument,
} from "../support/context";
import { markerPosition } from "../support/markers";
import { hoversAt } from "../support/providers";

suite("Hover", () => {
  test("renders the imported declaration's type", async () => {
    const context = await integrationTestContext();
    const document = await openWorkspaceDocument(context, "Main.purs");
    const hovers = await hoversAt(
      document,
      markerPosition(document, "shared-use"),
    );

    assert.strictEqual(hovers.length, 1);
    const contents = hovers[0].contents
      .map((content) => (typeof content === "string" ? content : content.value))
      .join("\n");
    assert.match(contents, /shared :: Int/);
  });
});
