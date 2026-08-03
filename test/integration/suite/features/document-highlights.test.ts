import * as assert from "assert";

import { suite, test } from "mocha";
import * as vscode from "vscode";

import {
  integrationTestContext,
  openWorkspaceDocument,
} from "../support/context";
import { markerPosition } from "../support/markers";
import { normalizeRange } from "../support/normalize";

suite("Document highlights", () => {
  test("highlights the declaration and use", async () => {
    const context = await integrationTestContext();
    const document = await openWorkspaceDocument(context, "Main.purs");
    const highlights = await vscode.commands.executeCommand<
      vscode.DocumentHighlight[]
    >(
      "vscode.executeDocumentHighlights",
      document.uri,
      markerPosition(document, "identity-use"),
    );

    assert.deepStrictEqual(
      highlights.map((highlight) => normalizeRange(highlight.range)),
      [
        [4, 0, 4, 8],
        [6, 9, 6, 17],
      ],
    );
  });
});
