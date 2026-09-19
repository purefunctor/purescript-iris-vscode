import * as fs from "fs";
import * as path from "path";
import { spawnSync } from "child_process";

import {
  downloadAndUnzipVSCode,
  resolveCliArgsFromVSCodeExecutablePath,
  runTests,
} from "@vscode/test-electron";
import * as dotenv from "dotenv";

dotenv.config({
  path: path.resolve(__dirname, "..", "..", "..", ".env"),
  quiet: true,
});

async function main() {
  const variant = process.argv[2] === "failure" ? "failure" : "prepared";
  const extensionDevelopmentPath = path.resolve(__dirname, "..", "..", "..");
  const extensionTestsPath = path.resolve(
    __dirname,
    variant === "failure" ? "suite-failure" : "suite",
  );
  const workspacePath = path.resolve(
    extensionDevelopmentPath,
    ".vscode-test",
    "workspaces",
    "iris",
  );
  const userDataPath = path.resolve(
    extensionDevelopmentPath,
    ".vscode-test",
    "user-data",
    "iris",
  );
  const extensionsPath = path.resolve(
    extensionDevelopmentPath,
    ".vscode-test",
    "extensions",
    "iris",
  );
  const fixturesPath = path.resolve(
    extensionDevelopmentPath,
    "test",
    "integration",
    "fixtures",
  );
  const irisPath = requireExecutablePath("IRIS_PATH");
  const spagoPath = path.resolve(
    extensionDevelopmentPath,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "spago.cmd" : "spago",
  );

  prepareWorkspace(workspacePath, fixturesPath, irisPath, variant);
  fs.rmSync(userDataPath, { recursive: true, force: true });
  fs.rmSync(extensionsPath, { recursive: true, force: true });

  const vscodeExecutablePath = await downloadAndUnzipVSCode(
    process.env.VSCODE_VERSION,
  );
  installExtension(
    vscodeExecutablePath,
    extensionsPath,
    "nwolverson.language-purescript",
  );

  await runTests({
    vscodeExecutablePath,
    extensionDevelopmentPath,
    extensionTestsPath,
    extensionTestsEnv: { IRIS_SPAGO: spagoPath },
    launchArgs: [
      workspacePath,
      "--user-data-dir",
      userDataPath,
      "--extensions-dir",
      extensionsPath,
      "--disable-workspace-trust",
      "--skip-release-notes",
      "--skip-welcome",
    ],
  });
}

function installExtension(
  vscodeExecutablePath: string,
  extensionsPath: string,
  extensionId: string,
) {
  const [command, ...args] =
    resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);
  const isolatedArgs = args.filter(
    (argument) => !argument.startsWith("--extensions-dir"),
  );
  const result = spawnSync(
    command,
    [
      ...isolatedArgs,
      "--extensions-dir",
      extensionsPath,
      "--install-extension",
      extensionId,
      "--force",
    ],
    {
      encoding: "utf8",
      shell: process.platform === "win32",
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `Failed to install VS Code extension dependency: ${extensionId}`,
    );
  }
}

function requireExecutablePath(environmentVariable: string) {
  const executablePath = process.env[environmentVariable]?.trim();
  if (!executablePath) {
    throw new Error(
      `${environmentVariable} must be set. See .env.example for the expected format.`,
    );
  }

  if (!path.isAbsolute(executablePath)) {
    throw new Error(`${environmentVariable} must be an absolute path.`);
  }

  try {
    fs.accessSync(executablePath, fs.constants.X_OK);
  } catch {
    throw new Error(
      `${environmentVariable} must point to an executable file: ${executablePath}`,
    );
  }

  return executablePath;
}

function prepareWorkspace(
  workspacePath: string,
  fixturesPath: string,
  irisPath: string,
  variant: "prepared" | "failure",
) {
  const vscodeDirectory = path.join(workspacePath, ".vscode");
  const srcDirectory = path.join(workspacePath, "src");
  fs.mkdirSync(vscodeDirectory, { recursive: true });
  fs.rmSync(srcDirectory, { recursive: true, force: true });
  fs.cpSync(path.join(fixturesPath, "workspace"), srcDirectory, {
    recursive: true,
  });

  // Start every run without prepared dependencies so startup preparation is
  // exercised rather than satisfied by a stale `.spago` directory.
  fs.rmSync(path.join(workspacePath, ".spago"), {
    recursive: true,
    force: true,
  });
  fs.rmSync(path.join(workspacePath, "spago.lock"), { force: true });
  if (variant === "failure") {
    fs.writeFileSync(
      path.join(workspacePath, "spago.yaml"),
      [
        "workspace:",
        "  packageSet:",
        "    registry: 64.10.0",
        "package:",
        "  name: integration-test",
        "  dependencies:",
        "    - iris-nonexistent-dependency",
        "",
      ].join("\n"),
    );
  } else {
    fs.copyFileSync(
      path.join(fixturesPath, "project", "spago.yaml"),
      path.join(workspacePath, "spago.yaml"),
    );
    fs.copyFileSync(
      path.join(fixturesPath, "project", "spago.lock"),
      path.join(workspacePath, "spago.lock"),
    );
  }

  fs.writeFileSync(
    path.join(vscodeDirectory, "settings.json"),
    JSON.stringify(
      {
        "iris.client.serverPath": irisPath,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
