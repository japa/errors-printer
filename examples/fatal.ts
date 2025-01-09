/*
 * @japa/errors-printer
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ErrorsPrinter } from '../src/printer.js'

await new ErrorsPrinter({}).printError(new Error('Something went wrong'))
console.log('PARSED')
console.log(await new ErrorsPrinter({}).parseError(new Error('Something went wrong')))
