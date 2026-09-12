import { ExtensionContext, Uri, workspace } from "vscode";
import { resolveConfiguration, SourceCommand } from "./configuration";
import { normalizeWindowsFileUri } from "./uri";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const clientConfig = workspace.getConfiguration("iris.client");
  const irisConfig = workspace.getConfiguration("iris");
  const resolvedConfig = resolveConfiguration({
    client: {
      serverPath: clientConfig.get<string>("serverPath"),
    },
    iris: {
      serverPath: irisConfig.get<string>("serverPath"),
      sourceCommand: irisConfig.get<SourceCommand | null>("sourceCommand"),
    },
  });

  const args = ["lsp"];
  if (resolvedConfig.sourceCommand) {
    args.push(
      "--config",
      JSON.stringify({
        sources: { kind: "command", ...resolvedConfig.sourceCommand },
      }),
    );
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
