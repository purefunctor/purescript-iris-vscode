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

  test("keeps server path defaults empty for runtime fallback", () => {
    const properties = packageJson.contributes.configuration.properties;

    assert.strictEqual(properties["iris.client.serverPath"].default, "");
    assert.strictEqual(properties["iris.serverPath"].default, "");
  });

  test("does not override server diagnostic defaults", () => {
    const properties = packageJson.contributes.configuration.properties;

    for (const name of ["onOpen", "onSave", "onChange"] as const) {
      const setting = properties[`iris.server.diagnostics.${name}`];
      assert.deepStrictEqual(setting.type, ["boolean", "null"]);
      assert.strictEqual(setting.default, null);
      assert.strictEqual(setting.scope, "resource");
    }
  });

  test("marks legacy settings as deprecated", () => {
    const properties = packageJson.contributes.configuration.properties;

    assert.match(
      properties["iris.serverPath"].deprecationMessage,
      /iris\.client\.serverPath/,
    );
  });
});
