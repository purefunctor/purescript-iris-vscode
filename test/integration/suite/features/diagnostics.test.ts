import * as assert from "assert";

import { suite, teardown, test } from "mocha";
import * as vscode from "vscode";

import {
  integrationTestContext,
  openWorkspaceDocument,
  readFixture,
  replaceDocument,
  restoreWorkspaceFiles,
  waitUntil,
} from "../support/context";
import { normalizeRange } from "../support/normalize";

suite("Diagnostics", () => {
  teardown(async () => {
    const context = await integrationTestContext();
    await restoreWorkspaceFiles(context, "Diagnostics.purs");
  });

  test("publishes an exact error and clears it after save", async () => {
    const context = await integrationTestContext();
    const document = await openWorkspaceDocument(context, "Diagnostics.purs");
    const diagnostics = await waitUntil("the type mismatch diagnostic", () => {
      const published = vscode.languages.getDiagnostics(document.uri);
      return published.length > 0 ? published : undefined;
    });

    assert.strictEqual(diagnostics.length, 1);
    assert.strictEqual(
      diagnostics[0].severity,
      vscode.DiagnosticSeverity.Error,
    );
    assert.deepStrictEqual(normalizeRange(diagnostics[0].range), [3, 7, 3, 19]);
    assert.match(diagnostics[0].message, /String/);
    assert.match(diagnostics[0].message, /Int/);

    await replaceDocument(
      document,
      await readFixture(context, "expected", "Diagnostics.valid.purs"),
    );
    await waitUntil("diagnostics to clear after saving", () =>
      vscode.languages.getDiagnostics(document.uri).length === 0
        ? true
        : undefined,
    );
  });
});
