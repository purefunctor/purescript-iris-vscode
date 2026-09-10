# Iris for Visual Studio Code

[Iris](https://github.com/purefunctor/purescript-iris) integration for Visual Studio Code.

## Source discovery

Iris discovers sources through `spago.lock` by default. To use a command instead,
set `iris.sourceCommand` in your VS Code settings:

```json
{
  "iris.sourceCommand": {
    "program": "spago",
    "arguments": ["sources"]
  }
}
```

The command must print one source path or glob per line. Arguments are passed
unchanged, without shell parsing or expansion. Only configure commands you trust.
Omit `arguments` when the program takes no arguments. Set `iris.sourceCommand` to
`null` or remove it to use Spago discovery, provided no deprecated source command
is configured. Reload the VS Code window after changing source discovery settings.

String values such as `"spago sources"` must be migrated to the object above for
Iris's `--config` interface. The deprecated `purescriptAnalyzer.sourceCommand`
setting uses the same object format.
