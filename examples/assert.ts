/*
 * @japa/errors-printer
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { assert } from 'chai'
import { ErrorsPrinter } from '../src/printer.js'

try {
  assert.equal(2 + 2, 5)
} catch (error) {
  await new ErrorsPrinter({}).printError(error)
  console.log('PARSED')
  console.log(await new ErrorsPrinter({}).parseError(error))
}
