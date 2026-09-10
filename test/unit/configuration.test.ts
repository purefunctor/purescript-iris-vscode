import * as assert from "assert";
import * as path from "path";
import { describe, test } from "vitest";

import {
  defaultServerCommands,
  findExecutable,
  findFirstExecutable,
  resolveConfiguration,
} from "../../src/configuration";

class FakeFileSystem {
  constructor(private readonly executableFiles: readonly string[]) {}

  isExecutableFile(filePath: string) {
    return this.executableFiles.includes(filePath);
  }
}

describe("configuration", () => {
  test("prefers Iris settings over legacy settings", () => {
    const config = resolveConfiguration({
      iris: {
        serverPath: " /bin/iris ",
        sourceCommand: " find src -name '*.purs' ",
      },
      purescriptAnalyzer: {
        serverPath: "/bin/purescript-analyzer",
        sourceCommand: "legacy-source-command",
      },
      pathValue: "",
    });

    assert.strictEqual(config.serverPath, "/bin/iris");
    assert.strictEqual(config.sourceCommand, "find src -name '*.purs'");
  });

  test("uses legacy settings when Iris settings are empty", () => {
    const config = resolveConfiguration({
      iris: {
        serverPath: " ",
        sourceCommand: "",
      },
      purescriptAnalyzer: {
        serverPath: " /bin/purescript-analyzer ",
        sourceCommand: " legacy-source-command ",
      },
      pathValue: "",
    });

    assert.strictEqual(config.serverPath, "/bin/purescript-analyzer");
    assert.strictEqual(config.sourceCommand, "legacy-source-command");
  });

  test("searches server commands in the expected order", () => {
    assert.deepStrictEqual(defaultServerCommands, [
      "iris",
      "purescript-analyzer",
    ]);
  });

  test("finds the first executable server command on PATH", () => {
    const firstDirectory = path.join("tmp", "first");
    const secondDirectory = path.join("tmp", "second");
    const pathValue = [firstDirectory, secondDirectory].join(":");
    const fileSystem = new FakeFileSystem([
      path.join(firstDirectory, "purescript-analyzer"),
      path.join(secondDirectory, "iris"),
    ]);

    const executablePath = findFirstExecutable(
      defaultServerCommands,
      pathValue,
      {
        fileSystem,
        platform: "darwin",
      },
    );

    assert.strictEqual(executablePath, path.join(secondDirectory, "iris"));
  });

  test("falls back to iris when no server command is found", () => {
    const config = resolveConfiguration({
      pathValue: "",
      fileSystem: new FakeFileSystem([]),
    });

    assert.strictEqual(config.serverPath, "iris");
    assert.strictEqual(config.sourceCommand, undefined);
  });

  test("uses PATHEXT when searching for Windows executables", () => {
    const directory = "C:\\Tools";
    const executablePath = path.join(directory, "iris.EXE");
    const result = findExecutable("iris", directory, {
      fileSystem: new FakeFileSystem([executablePath]),
      pathExtensions: ".EXE;.CMD",
      platform: "win32",
    });

    assert.strictEqual(result, executablePath);
  });
});
