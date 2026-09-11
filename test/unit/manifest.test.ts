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

  test("contributes client, server, and flat legacy settings", () => {
    const properties = packageJson.contributes.configuration.properties;

    assert.ok(properties["iris.client.serverPath"]);
    assert.ok(properties["iris.server.sources"]);
    assert.ok(properties["iris.server.diagnostics.onOpen"]);
    assert.ok(properties["iris.server.diagnostics.onSave"]);
    assert.ok(properties["iris.server.diagnostics.onChange"]);
    assert.ok(properties["iris.serverPath"]);
    assert.ok(properties["iris.sourceCommand"]);
  });

  test("keeps server path defaults empty for runtime fallback", () => {
    const properties = packageJson.contributes.configuration.properties;

    assert.strictEqual(properties["iris.client.serverPath"].default, "");
    assert.strictEqual(properties["iris.serverPath"].default, "");
  });

  test("describes the server source-discovery schema without overriding defaults", () => {
    const properties = packageJson.contributes.configuration.properties;
    const sources = properties["iris.server.sources"];

    assert.strictEqual(sources.default, null);
    assert.strictEqual(sources.scope, "resource");
    assert.deepStrictEqual(
      sources.oneOf.map((alternative) => alternative.type),
      ["null", "object", "object"],
    );
    const spago = sources.oneOf[1];
    assert.deepStrictEqual(spago.required, ["kind"]);
    assert.strictEqual(spago.additionalProperties, false);
    assert.strictEqual(spago.properties.kind.const, "spago");
    const command = sources.oneOf[2];
    assert.deepStrictEqual(command.required, ["kind", "program"]);
    assert.strictEqual(command.additionalProperties, false);
    assert.strictEqual(command.properties.kind.const, "command");
    assert.ok(command.properties.program);
    assert.ok(command.properties.arguments);
    assert.strictEqual(command.properties.program.type, "string");
    assert.strictEqual(command.properties.arguments.type, "array");
    assert.strictEqual(command.properties.arguments.items.type, "string");
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

  test("keeps the legacy source command structured", () => {
    const properties = packageJson.contributes.configuration.properties;
    const setting = properties["iris.sourceCommand"];

    assert.deepStrictEqual(setting.type, ["object", "null"]);
    assert.strictEqual(setting.default, null);
    assert.deepStrictEqual(setting.required, ["program"]);
    assert.strictEqual(setting.additionalProperties, false);
    assert.strictEqual(setting.properties.program.type, "string");
    assert.strictEqual(setting.properties.arguments.type, "array");
    assert.strictEqual(setting.properties.arguments.items.type, "string");
  });

  test("marks legacy settings as deprecated", () => {
    const properties = packageJson.contributes.configuration.properties;

    assert.match(
      properties["iris.serverPath"].deprecationMessage,
      /iris\.client\.serverPath/,
    );
    assert.match(
      properties["iris.sourceCommand"].deprecationMessage,
      /iris\.server\.sources/,
    );
  });
});
