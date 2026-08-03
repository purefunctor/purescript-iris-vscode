import * as assert from "assert";

import { suite, test } from "mocha";
import * as vscode from "vscode";

import {
  integrationTestContext,
  openWorkspaceDocument,
} from "../support/context";

interface DecodedToken {
  line: number;
  character: number;
  length: number;
  tokenType: string;
  modifiers: string[];
}

suite("Semantic tokens", () => {
  test("classifies representative declaration and use spans", async () => {
    const context = await integrationTestContext();
    const document = await openWorkspaceDocument(context, "Main.purs");
    const tokens = await vscode.commands.executeCommand<vscode.SemanticTokens>(
      "vscode.provideDocumentSemanticTokens",
      document.uri,
    );
    const legend = await vscode.commands.executeCommand<vscode.SemanticTokensLegend>(
      "vscode.provideDocumentSemanticTokensLegend",
      document.uri,
    );
    const decoded = decode(tokens.data, legend).filter(
      (token) =>
        (token.line === 4 && token.character === 0 && token.length === 8) ||
        (token.line === 6 && token.character === 9 && token.length === 8),
    );

    assert.deepStrictEqual(decoded, [
      {
        line: 4,
        character: 0,
        length: 8,
        tokenType: "function",
        modifiers: ["declaration"],
      },
      {
        line: 6,
        character: 9,
        length: 8,
        tokenType: "variable",
        modifiers: [],
      },
    ]);
  });
});

function decode(
  data: Uint32Array,
  legend: vscode.SemanticTokensLegend,
): DecodedToken[] {
  const tokens: DecodedToken[] = [];
  let line = 0;
  let character = 0;

  for (let index = 0; index < data.length; index += 5) {
    line += data[index];
    character =
      data[index] === 0 ? character + data[index + 1] : data[index + 1];
    tokens.push({
      line,
      character,
      length: data[index + 2],
      tokenType: legend.tokenTypes[data[index + 3]],
      modifiers: legend.tokenModifiers.filter(
        (_, modifierIndex) =>
          (data[index + 4] & (1 << modifierIndex)) !== 0,
      ),
    });
  }

  return tokens;
}
