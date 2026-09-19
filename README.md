# Iris for Visual Studio Code

[Iris](https://github.com/purefunctor/purescript-iris) integration for Visual Studio Code.

## Source discovery

Iris prepares the Spago workspace during startup: it runs `spago fetch` in the workspace root
before serving analysis. If preparation fails, Iris reports the failure and does not serve analysis
from the partially installed project; correct the project and restart Iris. Discovered sources come
from `spago.yaml` and the fetched `.spago` checkouts.

## Settings

VS Code client settings use the `iris.client` namespace. For example, set
`iris.client.serverPath` to select a particular Iris executable. Language server
settings use `iris.server`; diagnostic triggers are available as
`iris.server.diagnostics.onOpen`, `iris.server.diagnostics.onSave`, and
`iris.server.diagnostics.onChange`.
