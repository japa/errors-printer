# @japa/errors-printer
> Print errors produced by the Japa tests runner

[![github-actions-image]][github-actions-url] [![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

## Installation
Install the package from the npm registry as follows:

```sh
npm i @japa/errors-printer

# yarn
yarn add @japa/errors-printer
```

## Usage
You can print errors produced by japa test runner as follows.

```ts
import { ErrorsPrinter } from '@japa/errors-printer'

const printer = new ErrorsPrinter()
const error = new Error('boom')

await printer.printError(error)
```

Most of the times, you will find yourself printing errors using the Japa test summary. Here is how you can go about doing it.

```ts
import { ErrorsPrinter } from '@japa/errors-printer'

const printer = new ErrorsPrinter()

// assuming you have the runner instance
const summary = runner.getSummary()

/**
 * Printing all the errors inside the failure tree
 */
for (let suite in summary.failureTree) {
  await printer.printErrors(suite.name, suite.errors)

  for (let groupOrTest in suite.children) {
    if (groupOrTest.type === 'test') {
      await printer.printErrors(groupOrTest.title, groupOrTest.errors)
    } else {
      await printer.printErrors(groupOrTest.title, groupOrTest.errors)

      for (let group in groupOrTest.children) {
        await printer.printErrors(group.title, group.errors)
      }
    }
  }
}
```

## API
Following are the available methods.

### printError()
Accepts error as the only argument. If the error is an assertion error, then the diff will be displayed. Otherwise, the error stack is printed.

**Assertion diff**

```ts
import { Assert } from '@japa/assert'
import { ErrorsPrinter } from '@japa/errors-printer'

const printer = new ErrorsPrinter()

try {
  new Assert().deepEqual({ id: 1 }, { id: 2 })
} catch (error) {
  await printer.printError(error)
}
```

![](assets/diff-error.png)

**Error stack**

```ts
import { ErrorsPrinter } from '@japa/errors-printer'

const printer = new ErrorsPrinter()
await printer.printError(new Error('boom'))
```

![](assets/error-stack.png)

[github-actions-image]: https://img.shields.io/github/workflow/status/japa/errors-printer/test?style=for-the-badge

[github-actions-url]: https://github.com/japa/errors-printer/actions/workflows/test.yml "github-actions"

[npm-image]: https://img.shields.io/npm/v/@japa/errors-printer.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@japa/errors-printer "npm"

[license-image]: https://img.shields.io/npm/l/@japa/errors-printer?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"
