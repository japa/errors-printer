/*
 * @japa/errors-printer
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Youch from 'youch'
import { EOL } from 'os'
import { inspect } from 'util'
import forTerminal from 'youch-terminal'
import { diff as jestDiff } from 'jest-diff'
import { logger, icons } from '@poppinss/cliui'

/**
 * Print test runner errors
 */
export class ErrorsPrinter {
  /**
   * Returns human readable message for error phase
   */
  private getPhaseTitle(phase: string) {
    switch (phase) {
      case 'setup':
        return 'Setup hook'
      case 'setup:cleanup':
        return 'Setup hook cleanup function'
      case 'teardown':
        return 'Teardown hook'
      case 'teardown:cleanup':
        return 'Teardown hook cleanup function'
    }
  }

  /**
   * Pretty print the error to the console
   */
  public async printError(error: any) {
    const { actual, expected } = error

    /**
     * Assertion error
     */
    if (actual && expected) {
      console.log()

      const diff = jestDiff(expected, actual, {
        expand: true,
        includeChangeCounts: true,
        compareKeys: () => 0, // Preserves keys order
      })

      if (!diff || diff.includes('Comparing two different types of values.')) {
        console.log(`  Assertion Error: ${error.message}`)
        console.log(diff)
        console.log()
        console.log(`  ${logger.colors.green('Expected')}`)
        console.log(
          inspect(expected, { colors: true })
            .split(EOL)
            .map((line) => `  ${line}`)
            .join(EOL)
        )

        console.log()
        console.log(`  ${logger.colors.red('Actual')}`)
        console.log(
          inspect(actual, { colors: true })
            .split(EOL)
            .map((line) => `  ${line}`)
            .join(EOL)
        )
      } else {
        console.log(`  Assertion Error: ${error.message}`)
        console.log()
        console.log(diff)
      }

      console.log()
      return
    }

    const jsonResponse = await new Youch(error, {}).toJSON()
    console.log(forTerminal(jsonResponse, { prefix: '  ', hideErrorTitle: true }))
  }

  /**
   * Print summary errors
   */
  public async printErrors(label: string, errors: { phase: string; error: any }[]) {
    for (let { phase, error } of errors) {
      console.log(logger.colors.red(`${icons.cross} ${label}`))
      if (phase !== 'test') {
        console.log(`  ${logger.colors.red(`(${this.getPhaseTitle(phase)})`)}`)
      }

      await this.printError(error)
      console.log()
    }
  }
}
