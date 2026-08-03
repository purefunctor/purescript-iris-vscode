import * as assert from "assert";

import * as vscode from "vscode";

const markerPattern = /^\s*--\s*@marker\s+([a-z0-9-]+)\s+(\d+)\s*$/;

export function markerPosition(
  document: vscode.TextDocument,
  markerName: string,
): vscode.Position {
  const markers = collectMarkers(document);
  const position = markers.get(markerName);
  assert.ok(
    position,
    `Expected marker '${markerName}' in ${document.fileName}.`,
  );
  return position;
}

export function markerRange(
  document: vscode.TextDocument,
  markerName: string,
  expectedText: string,
): vscode.Range {
  const start = markerPosition(document, markerName);
  const end = document.positionAt(
    document.offsetAt(start) + expectedText.length,
  );
  const range = new vscode.Range(start, end);
  assert.strictEqual(
    document.getText(range),
    expectedText,
    `Marker '${markerName}' did not point to '${expectedText}' in ${document.fileName}.`,
  );
  return range;
}

function collectMarkers(
  document: vscode.TextDocument,
): Map<string, vscode.Position> {
  const markers = new Map<string, vscode.Position>();
  let sourceLine: number | undefined;

  for (let line = 0; line < document.lineCount; line += 1) {
    const text = document.lineAt(line).text;
    const marker = markerPattern.exec(text);
    if (!marker) {
      sourceLine = line;
      continue;
    }

    if (sourceLine === undefined) {
      assert.fail(
        `Marker '${marker[1]}' has no preceding source line in ${document.fileName}.`,
      );
    }
    assert.ok(
      !markers.has(marker[1]),
      `Marker '${marker[1]}' is duplicated in ${document.fileName}.`,
    );

    const character = Number(marker[2]);
    assert.ok(
      character <= document.lineAt(sourceLine).text.length,
      `Marker '${marker[1]}' is outside its source line in ${document.fileName}.`,
    );
    markers.set(marker[1], new vscode.Position(sourceLine, character));
  }

  return markers;
}
