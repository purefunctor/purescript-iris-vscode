import * as assert from "assert";

import { suite, test } from "mocha";

import {
  integrationTestContext,
  openWorkspaceDocument,
} from "../support/context";

suite("Activation", () => {
  test("activates for a registered PureScript document", async () => {
    const context = await integrationTestContext();
    const document = await openWorkspaceDocument(context, "Main.purs");

    assert.strictEqual(context.extension.isActive, true);
    assert.strictEqual(document.languageId, "purescript");
  });
});
