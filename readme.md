# babel-plugin-undebug

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

[Babel][] plugin to remove [`debug`][debug] from code.
Useful when `debug` is used to debug development and can be stripped in
production.

## Install

[npm][]:

```sh
npm install babel-plugin-undebug
```

## Use

`example.js`:

```js
var debug = require('debug')('math')

var value = 1
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
var value = 1;
value++;
```

## API

### `babel-plugin-undebug`

This is a [Babel][] plugin.
See [its documentation][babel-plugins] on how to use Babel plugins.

###### Notes

*   ESM (`import`) and CJS (`require`) are supported
*   This looks for the import by string: `'debug'`, other imports are ignored
*   Both `createDebug`
    (`var createDebug = require('debug'); d = createDebug('math')`)
    and direct use
    (`var d = require('debug')('math')`)
    are supported
*   Removes whole debug calls, so side effects
    (`d(value++)`)
    will be trimmed
*   PRs welcome for the other `debug` functionality that might be missing

## Related

*   [`babel-plugin-unassert`](https://github.com/unassert-js/babel-plugin-unassert)
    — Remove `assert`

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

[license]: license

[author]: https://wooorm.com

[debug]: https://github.com/visionmedia/debug

[babel]: https://babeljs.io

[babel-plugins]: https://babeljs.io/docs/plugins
