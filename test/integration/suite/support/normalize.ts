import * as vscode from "vscode";

export type NormalizedRange = [number, number, number, number];

export interface NormalizedLocation {
  path: string;
  range: NormalizedRange;
}

export interface NormalizedTextEdit extends NormalizedLocation {
  newText: string;
}

export function normalizeRange(range: vscode.Range): NormalizedRange {
  return [
    range.start.line,
    range.start.character,
    range.end.line,
    range.end.character,
  ];
}

export function normalizeLocation(
  location: vscode.Location | vscode.LocationLink,
): NormalizedLocation {
  const isLocationLink = "targetUri" in location;
  const uri = isLocationLink ? location.targetUri : location.uri;
  const range = isLocationLink
    ? (location.targetSelectionRange ?? location.targetRange)
    : location.range;
  return {
    path: vscode.workspace.asRelativePath(uri, false),
    range: normalizeRange(range),
  };
}

export function normalizeWorkspaceEdit(
  edit: vscode.WorkspaceEdit,
): NormalizedTextEdit[] {
  return edit
    .entries()
    .flatMap(([uri, edits]) =>
      edits.map((textEdit) => ({
        path: vscode.workspace.asRelativePath(uri, false),
        range: normalizeRange(textEdit.range),
        newText: textEdit.newText,
      })),
    )
    .sort(
      (left, right) =>
        left.path.localeCompare(right.path) ||
        left.range[0] - right.range[0] ||
        left.range[1] - right.range[1],
    );
}
