import * as assert from "assert";
import { describe, test } from "vitest";

import packageJson = require("../../package.json");

describe("manifest", () => {
  test("uses Iris branding without changing the Marketplace identity", () => {
    assert.strictEqual(packageJson.displayName, "purescript-iris");
    assert.strictEqual(packageJson.contributes.configuration.title, "Iris");
    assert.strictEqual(packageJson.name, "purescript-analyzer");
    assert.strictEqual(packageJson.publisher, "purefunctor");
  });

  test("contributes preferred and legacy settings", () => {
    const properties = packageJson.contributes.configuration.properties;

    assert.ok(properties["iris.serverPath"]);
    assert.ok(properties["iris.sourceCommand"]);
    assert.ok(properties["purescriptAnalyzer.serverPath"]);
    assert.ok(properties["purescriptAnalyzer.sourceCommand"]);
  });

  test("keeps server path defaults empty for runtime fallback", () => {
    const properties = packageJson.contributes.configuration.properties;

    assert.strictEqual(properties["iris.serverPath"].default, "");
    assert.strictEqual(properties["purescriptAnalyzer.serverPath"].default, "");
  });

  test("marks legacy settings as deprecated", () => {
    const properties = packageJson.contributes.configuration.properties;

    assert.match(
      properties["purescriptAnalyzer.serverPath"].deprecationMessage,
      /iris\.serverPath/,
    );
    assert.match(
      properties["purescriptAnalyzer.sourceCommand"].deprecationMessage,
      /iris\.sourceCommand/,
    );
  });
});
