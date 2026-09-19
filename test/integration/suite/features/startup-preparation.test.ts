import * as assert from "assert";

import { suite, test } from "mocha";
import * as vscode from "vscode";

import {
  integrationTestContext,
  openWorkspaceDocument,
} from "../support/context";
import { markerPosition } from "../support/markers";
import { normalizeLocation } from "../support/normalize";
import { definitionsAt, hoversAt } from "../support/providers";

suite("Startup preparation", () => {
  test("navigates from a dependency use to its fetched declaration", async () => {
    const context = await integrationTestContext();
    const document = await openWorkspaceDocument(context, "Dependency.purs");
    const definitions = await definitionsAt(
      document,
      markerPosition(document, "dependency-unit-use"),
    );

    const locations = definitions.map(normalizeLocation);
    assert.strictEqual(locations.length, 1, JSON.stringify(locations));
    const [location] = locations;
    assert.match(
      location.path,
      /^\.spago\/p\/prelude-[\d.]+\/src\/Data\/Unit\.purs$/,
    );

    const dependencyUri = vscode.Uri.joinPath(
      context.workspaceFolder.uri,
      ...location.path.split("/"),
    );
    const source = Buffer.from(
      await vscode.workspace.fs.readFile(dependencyUri),
    ).toString("utf8");
    const declarationLine = source
      .split("\n")
      .findIndex((line) => line.includes("foreign import unit :: Unit"));
    assert.ok(declarationLine >= 0, "Expected the unit declaration.");
    assert.strictEqual(location.range[0], declarationLine);
  });

  test("hovers over a fetched dependency declaration", async () => {
    const context = await integrationTestContext();
    const document = await openWorkspaceDocument(context, "Dependency.purs");
    const hovers = await hoversAt(
      document,
      markerPosition(document, "dependency-unit-use"),
    );

    assert.ok(hovers.length > 0, "Expected a hover for a dependency use.");
    const contents = hovers
      .flatMap((hover) => hover.contents)
      .map((content) => (typeof content === "string" ? content : content.value))
      .join("\n");
    assert.match(contents, /unit\s*::\s*Unit/);
  });
});
