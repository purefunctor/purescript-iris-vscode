import * as assert from "assert";

import { suite, teardown, test } from "mocha";
import * as vscode from "vscode";

import {
  integrationTestContext,
  openWorkspaceDocument,
  readFixture,
  restoreWorkspaceFiles,
} from "../support/context";
import { markerRange } from "../support/markers";
import { normalizeWorkspaceEdit } from "../support/normalize";
import { codeActionsAt } from "../support/providers";

suite("Code actions", () => {
  teardown(async () => {
    const context = await integrationTestContext();
    await restoreWorkspaceFiles(context, "Actions.purs");
  });

  test("applies a typed-hole quick fix", async () => {
    const context = await integrationTestContext();
    const document = await openWorkspaceDocument(context, "Actions.purs");
    const holeRange = markerRange(document, "term-hole", "?term");
    const actions = await codeActionsAt(document, holeRange);
    const matchingActions = actions.filter(
      (candidate): candidate is vscode.CodeAction =>
        candidate instanceof vscode.CodeAction &&
        candidate.title === "Replace hole with 'argument'",
    );

    assert.strictEqual(
      matchingActions.length,
      1,
      "Expected exactly one argument typed-hole quick fix.",
    );
    const action = matchingActions[0];
    assert.strictEqual(
      action.kind?.value,
      vscode.CodeActionKind.QuickFix.value,
    );
    assert.ok(action.edit, "Expected the quick fix to contain an edit.");
    assert.deepStrictEqual(normalizeWorkspaceEdit(action.edit), [
      { path: "src/Actions.purs", range: [3, 20, 3, 25], newText: "argument" },
    ]);

    assert.strictEqual(await vscode.workspace.applyEdit(action.edit), true);
    assert.strictEqual(await document.save(), true);
    assert.strictEqual(
      document.getText(),
      await readFixture(context, "expected", "Actions.applied.purs"),
    );
  });
});
