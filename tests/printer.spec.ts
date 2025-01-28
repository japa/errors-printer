/*
 * @japa/errors-printer
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'node:test'
import { assert } from 'chai'
import { expect } from 'expect'
import { ErrorsPrinter } from '../src/printer.js'

test.describe('Errors printer', () => {
  test('print assert error', async () => {
    try {
      assert.equal(2 + 2, 5)
    } catch (error) {
      await new ErrorsPrinter({}).printError(error)
      console.log('PARSED')
      console.log(await new ErrorsPrinter({}).parseError(error))
    }
  })

  test('print expect error', async () => {
    try {
      expect(2 + 2).toEqual(5)
    } catch (error) {
      await new ErrorsPrinter({}).printError(error)
      console.log('PARSED')
      console.log(await new ErrorsPrinter({}).parseError(error))
    }
  })

  test('print error object', async () => {
    await new ErrorsPrinter({}).printError(new Error('Something went wrong'))
    console.log('PARSED')
    console.log(await new ErrorsPrinter({}).parseError(new Error('Something went wrong')))
  })
})
