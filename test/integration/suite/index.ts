import * as fs from "fs";
import * as path from "path";

import Mocha = require("mocha");

export async function run(): Promise<void> {
  const mocha = new Mocha({
    color: true,
    grep: process.env.MOCHA_GREP,
    timeout: 30_000,
    ui: "tdd",
  });
  for (const testFile of findTestFiles(path.resolve(__dirname, "features"))) {
    mocha.addFile(testFile);
  }
  await mocha.loadFilesAsync();

  await new Promise<void>((resolve, reject) => {
    const runner = mocha.run((failures) => {
      if (runner.total === 0) {
        reject(
          new Error(
            `No integration tests matched MOCHA_GREP=${JSON.stringify(process.env.MOCHA_GREP)}.`,
          ),
        );
      } else if (failures === 0) {
        resolve();
      } else {
        reject(new Error(`${failures} integration test(s) failed.`));
      }
    });
  });
}

function findTestFiles(directory: string): string[] {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory()
        ? findTestFiles(entryPath)
        : entry.name.endsWith(".test.js")
          ? [entryPath]
          : [];
    })
    .sort();
}
