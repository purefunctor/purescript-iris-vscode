import * as assert from "assert";

import { suite, teardown, test } from "mocha";
import * as vscode from "vscode";

import {
  integrationTestContext,
  openWorkspaceDocument,
  readFixture,
  restoreWorkspaceFiles,
} from "../support/context";
import { markerPosition } from "../support/markers";
import { normalizeWorkspaceEdit } from "../support/normalize";
import { renameAt } from "../support/providers";

suite("Rename", () => {
  teardown(async () => {
    const context = await integrationTestContext();
    await restoreWorkspaceFiles(context, "Main.purs", "Lib.purs");
  });

  test("applies the complete cross-file workspace edit", async () => {
    const context = await integrationTestContext();
    const mainDocument = await openWorkspaceDocument(context, "Main.purs");
    const libraryDocument = await openWorkspaceDocument(context, "Lib.purs");
    const edit = await renameAt(
      mainDocument,
      markerPosition(mainDocument, "shared-use"),
      "renamedShared",
    );

    assert.deepStrictEqual(normalizeWorkspaceEdit(edit), [
      { path: "src/Lib.purs", range: [2, 0, 2, 6], newText: "renamedShared" },
      { path: "src/Lib.purs", range: [4, 0, 4, 6], newText: "renamedShared" },
      { path: "src/Lib.purs", range: [6, 8, 6, 14], newText: "renamedShared" },
      {
        path: "src/Main.purs",
        range: [2, 12, 2, 18],
        newText: "renamedShared",
      },
      {
        path: "src/Main.purs",
        range: [6, 18, 6, 24],
        newText: "renamedShared",
      },
    ]);

    assert.strictEqual(await vscode.workspace.applyEdit(edit), true);
    assert.strictEqual(await mainDocument.save(), true);
    assert.strictEqual(await libraryDocument.save(), true);
    assert.strictEqual(
      mainDocument.getText(),
      await readFixture(context, "expected", "rename", "Main.purs"),
    );
    assert.strictEqual(
      libraryDocument.getText(),
      await readFixture(context, "expected", "rename", "Lib.purs"),
    );
  });
});
