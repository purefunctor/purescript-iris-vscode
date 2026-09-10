import { ExtensionContext, Uri, workspace } from "vscode";
import { resolveConfiguration } from "./configuration";
import { normalizeWindowsFileUri } from "./uri";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const config = workspace.getConfiguration("iris");
  const legacyConfig = workspace.getConfiguration("purescriptAnalyzer");
  const resolvedConfig = resolveConfiguration({
    iris: {
      serverPath: config.get<string>("serverPath"),
      sourceCommand: config.get<string>("sourceCommand"),
    },
    purescriptAnalyzer: {
      serverPath: legacyConfig.get<string>("serverPath"),
      sourceCommand: legacyConfig.get<string>("sourceCommand"),
    },
  });

  const args: string[] = [];
  if (resolvedConfig.sourceCommand) {
    args.push("--source-command", resolvedConfig.sourceCommand);
  }

  const serverOptions: ServerOptions = {
    command: resolvedConfig.serverPath,
    args,
    transport: TransportKind.stdio,
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "purescript" }],
    uriConverters: {
      code2Protocol: (uri) => {
        const serializedUri = uri.toString();
        return process.platform === "win32"
          ? normalizeWindowsFileUri(serializedUri)
          : serializedUri;
      },
      protocol2Code: (uri) => Uri.parse(uri),
    },
  };

  client = new LanguageClient("iris", "Iris", serverOptions, clientOptions);

  return client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
