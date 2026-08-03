import * as assert from "assert";
import { describe, test } from "vitest";

import { normalizeWindowsFileUri } from "../../src/uri";

describe("URI conversion", () => {
  test("canonicalizes a Windows drive letter and separator", () => {
    assert.strictEqual(
      normalizeWindowsFileUri("file:///d%3A/source/Main.purs"),
      "file:///D:/source/Main.purs",
    );
  });

  test("preserves URI encoding outside the drive separator", () => {
    assert.strictEqual(
      normalizeWindowsFileUri("file:///d%3A/my%20project/Main.purs"),
      "file:///D:/my%20project/Main.purs",
    );
  });

  test("leaves other URIs unchanged", () => {
    assert.strictEqual(
      normalizeWindowsFileUri("file:///home/user/Main.purs"),
      "file:///home/user/Main.purs",
    );
    assert.strictEqual(
      normalizeWindowsFileUri("untitled:d%3A/Main.purs"),
      "untitled:d%3A/Main.purs",
    );
  });
});
