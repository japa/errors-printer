# @japa/errors-printer
> Error printer to pretty print Japa errors

[![github-actions-image]][github-actions-url] [![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

## Installation
Install the package from the npm registry as follows:

```sh
npm i @japa/errors-printer
```

```sh
yarn add @japa/errors-printer
```

```sh
pnpm add @japa/errors-printer
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
const errorsList = []

summary.failureTree.forEach((suite) => {
  suite.errors.forEach((error) => {
    errorsList.push({ title: suite.name, ...error })
  })

  suite.children.forEach((groupOrTest) => {
    if (groupOrTest.type === 'test') {
      groupOrTest.errors.forEach((error) => {
        errorsList.push({ title: groupOrTest.title, ...error })
      })
      return
    }

    groupOrTest.errors.forEach((error) => {
      errorsList.push({ title: groupOrTest.name, ...error })
    })
    groupOrTest.children.forEach((test) => {
      test.errors.forEach((error) => {
        errorsList.push({ title: test.title, ...error })
      })
    })
  })
})

await printer.printErrors(errorsList)
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
  assert.equal(2 + 2, 5)
} catch (error) {
  await printer.printError(error)
}
```

![](assets/assert-error.png)

**Jest error**

```ts
import expect from 'expect'
import { ErrorsPrinter } from '@japa/errors-printer'

const printer = new ErrorsPrinter()

try {
  expect(2 + 2).toEqual(5)
} catch (error) {
  await printer.printError(error)
}
```

![](assets/expect-error.png)

**Error stack**

```ts
import { ErrorsPrinter } from '@japa/errors-printer'

const printer = new ErrorsPrinter()
await printer.printError(new Error('boom'))
```

![](assets/fatal-error.png)

### printErrors
Print an array of errors produced by the Japa test runner summary. The method accepts an array of errors in the following format.

```ts
type Error = {
  title: string,
  phase: string,
  error: Error
}
```

```ts
await printer.printErrors([
  {
    phase: 'test',
    title: '2 + 2 = 4'
    error: new Error('test failed')
  },
  {
    phase: 'teardown',
    title: '2 + 2 = 4'
    error: new Error('teardown failed')
  }
])
```

### parseError
Parses the error to JSON using Youch

```ts
import expect from 'expect'
import { ErrorsPrinter } from '@japa/errors-printer'

const printer = new ErrorsPrinter()

try {
  expect(2 + 2).toEqual(5)
} catch (error) {
  console.log(await printer.parseError(error))
}
```

Output

```ts
{
  message: '\x1B[2mexpect(\x1B[22m\x1B[31mreceived\x1B[39m\x1B[2m).\x1B[22mtoEqual\x1B[2m(\x1B[22m\x1B[32mexpected\x1B[39m\x1B[2m) // deep equality\x1B[22m\n' +
    '\n' +
    'Expected: \x1B[32m5\x1B[39m\n' +
    'Received: \x1B[31m4\x1B[39m',
  name: 'Error',
  frames: [
    {
      functionName: '<anonymous>',
      args: undefined,
      fileName: '/Users/virk/code/japa/errors-printer/examples/expect.ts',
      lineNumber: 14,
      columnNumber: 17,
      raw: '    at <anonymous> (/Users/virk/code/japa/errors-printer/examples/expect.ts:14:17)',
      type: 'app',
      fileType: 'fs',
      source: [Array]
    },
    {
      functionName: 'ModuleJob.run',
      args: undefined,
      fileName: 'node:internal/modules/esm/module_job',
      lineNumber: 268,
      columnNumber: 25,
      raw: '    at ModuleJob.run (node:internal/modules/esm/module_job:268:25)',
      type: 'native',
      fileType: 'fs',
      source: undefined
    },
    {
      functionName: 'async onImport.tracePromise.__proto__',
      args: undefined,
      fileName: 'node:internal/modules/esm/loader',
      lineNumber: 543,
      columnNumber: 26,
      raw: '    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:543:26)',
      type: 'native',
      fileType: 'fs',
      source: undefined
    },
    {
      functionName: 'async asyncRunEntryPointWithESMLoader',
      args: undefined,
      fileName: 'node:internal/modules/run_main',
      lineNumber: 116,
      columnNumber: 5,
      raw: '    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:116:5)',
      type: 'native',
      fileType: 'fs',
      source: undefined
    }
  ],
  hint: undefined,
  code: undefined,
  cause: undefined,
  stack: 'Error: \x1B[2mexpect(\x1B[22m\x1B[31mreceived\x1B[39m\x1B[2m).\x1B[22mtoEqual\x1B[2m(\x1B[22m\x1B[32mexpected\x1B[39m\x1B[2m) // deep equality\x1B[22m\n' +
    '\n' +
    'Expected: \x1B[32m5\x1B[39m\n' +
    'Received: \x1B[31m4\x1B[39m\n' +
    '    at <anonymous> (/Users/virk/code/japa/errors-printer/examples/expect.ts:14:17)\n' +
    '    at ModuleJob.run (node:internal/modules/esm/module_job:268:25)\n' +
    '    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:543:26)\n' +
    '    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:116:5)'
}
```

[github-actions-image]: https://img.shields.io/github/actions/workflow/status/japa/errors-printer/checks.yml?style=for-the-badge

[github-actions-url]: https://github.com/japa/errors-printer/actions/workflows/checks.yml "github-actions"

[npm-image]: https://img.shields.io/npm/v/@japa/errors-printer.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@japa/errors-printer "npm"

[license-image]: https://img.shields.io/npm/l/@japa/errors-printer?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"
