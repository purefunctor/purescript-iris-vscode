import * as assert from "assert";

import { suite, test } from "mocha";
import * as vscode from "vscode";

import {
  integrationTestContext,
  openWorkspaceDocument,
} from "../support/context";
import { markerPosition } from "../support/markers";
import { completionsAt } from "../support/providers";

suite("Completion", () => {
  test("returns resolved local and imported values", async () => {
    const context = await integrationTestContext();
    const document = await openWorkspaceDocument(context, "Main.purs");
    const completions = await completionsAt(
      document,
      markerPosition(document, "completion"),
    );

    const identity = completionNamed(completions, "identity");
    assert.strictEqual(identity.kind, vscode.CompletionItemKind.Value);
    assert.match(identity.detail ?? "", /identity/);

    const shared = completionNamed(completions, "shared");
    assert.strictEqual(shared.kind, vscode.CompletionItemKind.Value);
    assert.match(shared.detail ?? "", /shared/);
  });
});

function completionNamed(
  completions: vscode.CompletionList,
  expectedLabel: string,
): vscode.CompletionItem {
  const matches = completions.items.filter((item) => {
    const label =
      typeof item.label === "string" ? item.label : item.label.label;
    return label === expectedLabel;
  });
  assert.strictEqual(
    matches.length,
    1,
    `Expected one '${expectedLabel}' completion, received ${JSON.stringify(matches)}.`,
  );
  return matches[0];
}
