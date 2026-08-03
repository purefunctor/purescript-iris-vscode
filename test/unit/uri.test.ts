import * as assert from "assert";
import { describe, test } from "vitest";

import { decodeWindowsDriveSeparator } from "../../src/uri";

describe("URI conversion", () => {
  test("decodes an encoded Windows drive separator", () => {
    assert.strictEqual(
      decodeWindowsDriveSeparator("file:///d%3A/source/Main.purs"),
      "file:///d:/source/Main.purs",
    );
  });

  test("preserves URI encoding outside the drive separator", () => {
    assert.strictEqual(
      decodeWindowsDriveSeparator("file:///d%3A/my%20project/Main.purs"),
      "file:///d:/my%20project/Main.purs",
    );
  });

  test("leaves other URIs unchanged", () => {
    assert.strictEqual(
      decodeWindowsDriveSeparator("file:///home/user/Main.purs"),
      "file:///home/user/Main.purs",
    );
    assert.strictEqual(
      decodeWindowsDriveSeparator("untitled:d%3A/Main.purs"),
      "untitled:d%3A/Main.purs",
    );
  });
});
