import * as assert from "assert";
import * as path from "path";
import { describe, test } from "vitest";

import { findExecutable, resolveConfiguration } from "../../src/configuration";

class FakeFileSystem {
  constructor(private readonly executableFiles: readonly string[]) {}

  isExecutableFile(filePath: string) {
    return this.executableFiles.includes(filePath);
  }
}

describe("configuration", () => {
  test("prefers client settings over legacy settings", () => {
    const config = resolveConfiguration({
      client: {
        serverPath: " /bin/iris ",
      },
      iris: {
        serverPath: "/bin/flat-iris",
        sourceCommand: {
          program: "C:\\Program Files\\node.exe",
          arguments: ["source files.js", ' quoted "value" ', ""],
        },
      },
      pathValue: "",
    });

    assert.strictEqual(config.serverPath, "/bin/iris");
    assert.deepStrictEqual(config.sourceCommand, {
      program: "C:\\Program Files\\node.exe",
      arguments: ["source files.js", ' quoted "value" ', ""],
    });
  });

  test("uses flat Iris settings when client settings are empty", () => {
    const config = resolveConfiguration({
      client: {
        serverPath: " ",
      },
      iris: {
        serverPath: " /bin/iris ",
        sourceCommand: { program: "iris-source-command" },
      },
      pathValue: "",
    });

    assert.strictEqual(config.serverPath, "/bin/iris");
    assert.deepStrictEqual(config.sourceCommand, {
      program: "iris-source-command",
    });
  });

  test("leaves source discovery unspecified when the source command is unset", () => {
    const config = resolveConfiguration({
      iris: { sourceCommand: null },
      pathValue: "",
    });

    assert.strictEqual(config.sourceCommand, undefined);
  });

  test("resolves iris from PATH", () => {
    const firstDirectory = path.join("tmp", "first");
    const secondDirectory = path.join("tmp", "second");
    const pathValue = [firstDirectory, secondDirectory].join(":");
    const fileSystem = new FakeFileSystem([path.join(secondDirectory, "iris")]);

    const config = resolveConfiguration({
      fileSystem,
      pathValue,
      platform: "darwin",
    });

    assert.strictEqual(config.serverPath, path.join(secondDirectory, "iris"));
  });

  test("does not detect the legacy server command", () => {
    const directory = path.join("tmp", "bin");
    const config = resolveConfiguration({
      pathValue: directory,
      fileSystem: new FakeFileSystem([
        path.join(directory, "purescript-analyzer"),
      ]),
      platform: "darwin",
    });

    assert.strictEqual(config.serverPath, "iris");
    assert.strictEqual(config.sourceCommand, undefined);
  });

  test("uses PATHEXT when searching for Windows executables", () => {
    const directory = "C:\\Tools";
    const executablePath = path.join(directory, "iris.CMD");
    const result = findExecutable("iris", directory, {
      fileSystem: new FakeFileSystem([
        path.join(directory, "iris.EXE"),
        executablePath,
      ]),
      pathExtensions: ".CMD;.EXE",
      platform: "win32",
    });

    assert.strictEqual(result, executablePath);
  });
});
