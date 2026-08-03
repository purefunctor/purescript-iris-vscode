import * as vscode from "vscode";

export function completionsAt(
  document: vscode.TextDocument,
  position: vscode.Position,
): Thenable<vscode.CompletionList> {
  return vscode.commands.executeCommand<vscode.CompletionList>(
    "vscode.executeCompletionItemProvider",
    document.uri,
    position,
    undefined,
    20,
  );
}

export function hoversAt(
  document: vscode.TextDocument,
  position: vscode.Position,
): Thenable<vscode.Hover[]> {
  return vscode.commands.executeCommand<vscode.Hover[]>(
    "vscode.executeHoverProvider",
    document.uri,
    position,
  );
}

export function definitionsAt(
  document: vscode.TextDocument,
  position: vscode.Position,
): Thenable<(vscode.Location | vscode.LocationLink)[]> {
  return vscode.commands.executeCommand<
    (vscode.Location | vscode.LocationLink)[]
  >("vscode.executeDefinitionProvider", document.uri, position);
}

export function referencesAt(
  document: vscode.TextDocument,
  position: vscode.Position,
): Thenable<vscode.Location[]> {
  return vscode.commands.executeCommand<vscode.Location[]>(
    "vscode.executeReferenceProvider",
    document.uri,
    position,
  );
}

export function renameAt(
  document: vscode.TextDocument,
  position: vscode.Position,
  newName: string,
): Thenable<vscode.WorkspaceEdit> {
  return vscode.commands.executeCommand<vscode.WorkspaceEdit>(
    "vscode.executeDocumentRenameProvider",
    document.uri,
    position,
    newName,
  );
}

export function codeActionsAt(
  document: vscode.TextDocument,
  range: vscode.Range,
): Thenable<(vscode.Command | vscode.CodeAction)[]> {
  return vscode.commands.executeCommand<(vscode.Command | vscode.CodeAction)[]>(
    "vscode.executeCodeActionProvider",
    document.uri,
    range,
    vscode.CodeActionKind.QuickFix.value,
  );
}
