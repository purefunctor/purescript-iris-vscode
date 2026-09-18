import * as assert from "assert";

import * as vscode from "vscode";

export interface IntegrationTestContext {
  extension: vscode.Extension<unknown>;
  workspaceFolder: vscode.WorkspaceFolder;
}

let testContext: Promise<IntegrationTestContext> | undefined;

export function integrationTestContext(): Promise<IntegrationTestContext> {
  testContext ??= initialize();
  return testContext;
}

export async function openWorkspaceDocument(
  context: IntegrationTestContext,
  fileName: string,
): Promise<vscode.TextDocument> {
  return vscode.workspace.openTextDocument(
    vscode.Uri.joinPath(context.workspaceFolder.uri, "src", fileName),
  );
}

export async function readFixture(
  context: IntegrationTestContext,
  ...pathSegments: string[]
): Promise<string> {
  const contents = await vscode.workspace.fs.readFile(
    vscode.Uri.joinPath(
      context.extension.extensionUri,
      "test",
      "integration",
      "fixtures",
      ...pathSegments,
    ),
  );
  return Buffer.from(contents).toString("utf8");
}

export async function replaceDocument(
  document: vscode.TextDocument,
  contents: string,
): Promise<void> {
  const edit = new vscode.WorkspaceEdit();
  edit.replace(
    document.uri,
    new vscode.Range(
      document.positionAt(0),
      document.positionAt(document.getText().length),
    ),
    contents,
  );
  assert.strictEqual(await vscode.workspace.applyEdit(edit), true);
  assert.strictEqual(await document.save(), true);
}

export async function restoreWorkspaceFiles(
  context: IntegrationTestContext,
  ...fileNames: string[]
): Promise<void> {
  for (const fileName of fileNames) {
    const document = await openWorkspaceDocument(context, fileName);
    const contents = await readFixture(context, "workspace", fileName);
    await replaceDocument(document, contents);
  }
}

export async function waitUntil<T>(
  description: string,
  probe: () => T | undefined | Promise<T | undefined>,
  timeoutMilliseconds = 30_000,
): Promise<T> {
  const deadline = Date.now() + timeoutMilliseconds;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const result = await probe();
      if (result !== undefined) {
        return result;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  const errorSuffix =
    lastError instanceof Error ? ` Last error: ${lastError.message}` : "";
  assert.fail(`Timed out waiting for ${description}.${errorSuffix}`);
}

async function initialize(): Promise<IntegrationTestContext> {
  const extension = vscode.extensions.getExtension(
    "purefunctor.purescript-analyzer",
  );
  assert.ok(extension, "Expected Iris to be installed.");

  await waitUntil("Iris to activate", () => extension.isActive || undefined);

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  assert.ok(workspaceFolder, "Expected the test workspace to be open.");
  const context = { extension, workspaceFolder };
  await openWorkspaceDocument(context, "Main.purs");

  // Document symbols are cached per document version by the VS Code client, so
  // a request cancelled while Iris is still loading would leave the outline
  // empty until the document changes. Workspace symbols are not document
  // scoped and therefore reflect readiness reliably.
  await waitUntil("Iris to provide workspace symbols", async () => {
    const symbols = await vscode.commands.executeCommand<
      vscode.SymbolInformation[] | undefined
    >("vscode.executeWorkspaceSymbolProvider", "identity");
    return symbols?.some((symbol) => symbol.name === "identity") || undefined;
  });

  return context;
}
