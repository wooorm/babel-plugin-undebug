# babel-plugin-undebug

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Babel plugin to remove `debug` from code.

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`babelPluginUndebug`](#babelpluginundebug)
* [Syntax tree](#syntax-tree)
* [Types](#types)
* [Compatibility](#compatibility)
* [Security](#security)
* [Related](#related)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This package is a [Babel][] plugin to remove [`debug`][debug] from code.

## When should I use this?

This package is useful when `debug` is used to debug development code but can be
stripped in production.
An example is `micromark`, which is a complex state machine that can be plugged
into with extensions but it’s also supposed to be small in browsers.

## Install

This package is [ESM only][esm].
In Node.js (version 18+), install with [npm][]:

```sh
npm install babel-plugin-undebug
```

In Deno with [`esm.sh`][esmsh]:

```js
import babelPluginUndebug from 'https://esm.sh/babel-plugin-undebug@2'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import babelPluginUndebug from 'https://esm.sh/babel-plugin-undebug@2?bundle'
</script>
```

## Use

`example.js`:

```js
const debug = require('debug')('math')

let value = 1
debug('Value was %d', value)
value++
debug('Now we have %d', value)
```

Then (with `@babel/cli` and `@babel/core` installed):

```sh
babel example.js --plugins babel-plugin-undebug
```

Yields:

```js
let value = 1;
value++;
```

## API

This package exports no identifiers.
The default export is `babelPluginUndebug`.

### `babelPluginUndebug`

Plugin to remove `debug` from code.
See [Babel’s documentation][babel-plugins] on how to use Babel plugins.

## Syntax tree

This package operates on the Babel (JavaScript) AST.

* looks for ESM (`import`) and CJS (`require`) loading `'debug'`
* looks for code calling that function and assigning it, whether `createDebug`
  (`const createDebug = require('debug'), d = createDebug('math')`)
  or direct use
  (`const d = require('debug')('math')`)
* looks for calls of those assigned identifiers and remove whole debug calls,
  so side effects (`d(value++)`) will be dropped

## Types

This package is fully typed with [TypeScript][].
It exports no additional types.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 18+.
It also works in Deno and modern browsers.

## Security

This package is safe.

## Related

* [`babel-plugin-unassert`](https://github.com/unassert-js/babel-plugin-unassert)
  — remove `assert`

## Contribute

Yes please!
See [How to Contribute to Open Source][contribute].

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/babel-plugin-undebug/workflows/main/badge.svg

[build]: https://github.com/wooorm/babel-plugin-undebug/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/babel-plugin-undebug.svg

[coverage]: https://codecov.io/github/wooorm/babel-plugin-undebug

[downloads-badge]: https://img.shields.io/npm/dm/babel-plugin-undebug.svg

[downloads]: https://www.npmjs.com/package/babel-plugin-undebug

[size-badge]: https://img.shields.io/bundlephobia/minzip/babel-plugin-undebug.svg

[size]: https://bundlephobia.com/result?p=babel-plugin-undebug

[npm]: https://docs.npmjs.com/cli/install

[esmsh]: https://esm.sh

[license]: license

[author]: https://wooorm.com

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[contribute]: https://opensource.guide/how-to-contribute/

[debug]: https://github.com/visionmedia/debug

[babel]: https://babeljs.io

[babel-plugins]: https://babeljs.io/docs/plugins
