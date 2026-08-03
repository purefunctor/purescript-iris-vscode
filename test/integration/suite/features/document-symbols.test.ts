import * as assert from "assert";

import { suite, test } from "mocha";
import * as vscode from "vscode";

import {
  integrationTestContext,
  openWorkspaceDocument,
} from "../support/context";
import { normalizeRange } from "../support/normalize";

suite("Document symbols", () => {
  test("returns exact local declaration metadata", async () => {
    const context = await integrationTestContext();
    const document = await openWorkspaceDocument(context, "Main.purs");
    const symbols = await vscode.commands.executeCommand<
      (vscode.DocumentSymbol | vscode.SymbolInformation)[]
    >("vscode.executeDocumentSymbolProvider", document.uri);

    const normalized = symbols.map((symbol) => ({
      name: symbol.name,
      kind: symbol.kind,
      range: normalizeRange(
        symbol instanceof vscode.DocumentSymbol
          ? symbol.range
          : symbol.location.range,
      ),
    }));
    assert.deepStrictEqual(normalized, [
      {
        name: "identity",
        kind: vscode.SymbolKind.Function,
        range: [4, 0, 4, 22],
      },
      {
        name: "answer",
        kind: vscode.SymbolKind.Function,
        range: [6, 0, 6, 24],
      },
      {
        name: "completion",
        kind: vscode.SymbolKind.Function,
        range: [10, 0, 10, 12],
      },
    ]);
  });
});
