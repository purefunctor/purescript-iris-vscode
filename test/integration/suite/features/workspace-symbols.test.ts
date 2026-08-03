import * as assert from "assert";

import { suite, test } from "mocha";
import * as vscode from "vscode";

import { integrationTestContext } from "../support/context";
import { normalizeLocation } from "../support/normalize";

suite("Workspace symbols", () => {
  test("locates an exact declaration in another module", async () => {
    await integrationTestContext();
    const symbols = await vscode.commands.executeCommand<
      vscode.SymbolInformation[]
    >("vscode.executeWorkspaceSymbolProvider", "shared");
    const shared = symbols.filter((symbol) => symbol.name === "shared");

    assert.strictEqual(shared.length, 1);
    assert.strictEqual(shared[0].kind, vscode.SymbolKind.Function);
    assert.deepStrictEqual(normalizeLocation(shared[0].location), {
      path: "src/Lib.purs",
      range: [2, 0, 4, 11],
    });
  });
});
