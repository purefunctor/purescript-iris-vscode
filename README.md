# Iris for Visual Studio Code

[Iris](https://github.com/purefunctor/purescript-iris) integration for Visual Studio Code.

## Source discovery

Iris discovers sources through `spago.lock` by default. To use a command instead,
set `iris.server.sources` in your VS Code settings:

```json
{
  "iris.server.sources": {
    "kind": "command",
    "program": "spago",
    "arguments": ["sources"]
  }
}
```

The command must print one source path or glob per line. Arguments are passed
unchanged, without shell parsing or expansion. Only configure commands you trust.
Omit `arguments` when the program takes no arguments. Set `iris.server.sources` to
`{ "kind": "spago" }` to explicitly select Spago over a deprecated source command,
or remove it to inherit startup source discovery, which defaults to Spago. Server
settings apply without reloading the VS Code window.

The deprecated `iris.sourceCommand` and `purescriptAnalyzer.sourceCommand` settings
continue to configure startup source discovery during migration.

## Settings

VS Code client settings use the `iris.client` namespace. For example, set
`iris.client.serverPath` to select a particular Iris executable. Language server
settings use `iris.server`; diagnostic triggers are available as
`iris.server.diagnostics.onOpen`, `iris.server.diagnostics.onSave`, and
`iris.server.diagnostics.onChange`.
