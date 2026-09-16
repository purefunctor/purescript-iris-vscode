# Iris for Visual Studio Code

[Iris](https://github.com/purefunctor/purescript-iris) integration for Visual Studio Code.

## Source discovery

Iris discovers sources through `spago.lock`.

## Settings

VS Code client settings use the `iris.client` namespace. For example, set
`iris.client.serverPath` to select a particular Iris executable. Language server
settings use `iris.server`; diagnostic triggers are available as
`iris.server.diagnostics.onOpen`, `iris.server.diagnostics.onSave`, and
`iris.server.diagnostics.onChange`.
