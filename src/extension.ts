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
  const clientConfig = workspace.getConfiguration("iris.client");
  const irisConfig = workspace.getConfiguration("iris");
  const resolvedConfig = resolveConfiguration({
    client: {
      serverPath: clientConfig.get<string>("serverPath"),
    },
    iris: {
      serverPath: irisConfig.get<string>("serverPath"),
    },
  });

  const serverOptions: ServerOptions = {
    command: resolvedConfig.serverPath,
    args: ["lsp"],
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
