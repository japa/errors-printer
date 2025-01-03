/*
 * @japa/errors-printer
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect } from 'expect'
import { ErrorsPrinter } from '../src/printer.js'

try {
  expect(2 + 2).toEqual(5)
} catch (error) {
  await new ErrorsPrinter({}).printError(error)
}
