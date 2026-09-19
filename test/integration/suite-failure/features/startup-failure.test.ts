import * as assert from "assert";

import { suite, test } from "mocha";
import * as vscode from "vscode";

import { waitUntil } from "../../suite/support/context";

suite("Startup failure", () => {
  test("does not serve analysis for a project that fails preparation", async () => {
    const extension = vscode.extensions.getExtension(
      "purefunctor.purescript-analyzer",
    );
    assert.ok(extension, "Expected Iris to be installed.");
    await waitUntil("Iris to activate", () => extension.isActive || undefined);

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    assert.ok(workspaceFolder, "Expected the test workspace to be open.");
    const document = await vscode.workspace.openTextDocument(
      vscode.Uri.joinPath(workspaceFolder.uri, "src", "Main.purs"),
    );

    // Preparation fails for the broken manifest. After giving the server time
    // to report the failure, analysis must remain unavailable rather than
    // serving a partially installed project.
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    const symbols = await vscode.commands.executeCommand<
      (vscode.DocumentSymbol | vscode.SymbolInformation)[] | undefined
    >("vscode.executeDocumentSymbolProvider", document.uri);
    assert.ok(
      !symbols || symbols.length === 0,
      `Expected no analysis from a failed project, received ${symbols?.length} symbols.`,
    );
    assert.strictEqual(
      vscode.languages.getDiagnostics(document.uri).length,
      0,
      "Expected no diagnostics from a failed project.",
    );
  });
});
