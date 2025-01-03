/*
 * @japa/errors-printer
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { assert } from 'chai'
import { expect } from 'expect'
import { ErrorsPrinter } from '../src/printer.js'

let errors: any[] = [
  {
    phase: 'test',
    error: new Error('Something went wrong'),
    title: 'Fetch user',
  },
]

try {
  assert.equal(2 + 2, 5)
} catch (error) {
  errors.push({ error, phase: 'test', title: 'Assert 2 + 2 = 4' })
}

try {
  expect(2 + 2).toEqual(5)
} catch (error) {
  errors.push({ error, phase: 'test', title: 'Expect 2 + 2 = 4' })
}

await new ErrorsPrinter({}).printErrors(errors)
