/*
 * @japa/errors-printer
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EOL } from 'os'
import Youch from 'youch'
import forTerminal from 'youch-terminal'
import { diff as jestDiff } from 'jest-diff'
import { logger, icons } from '@poppinss/cliui'

/**
 * Print test runner errors
 */
export class ErrorsPrinter {
  private stackLinesCount: number

  constructor(options?: { stackLinesCount?: number }) {
    this.stackLinesCount = options?.stackLinesCount || 5
  }

  /**
   * Get Youch's JSON report of the given error
   */
  private async getYouchJson(error: any) {
    const youch = new Youch(
      error,
      {},
      {
        postLines: this.stackLinesCount,
        preLines: this.stackLinesCount,
      }
    )
    return youch.toJSON()
  }

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
   * Displays the error stack for a given error
   */
  private async displayErrorStack(error: any) {
    const jsonResponse = await this.getYouchJson(error)
    console.log(
      forTerminal(jsonResponse, {
        prefix: '  ',
        hideErrorTitle: true,
        displayShortPath: true,
        displayMainFrameOnly: true,
      })
    )
  }

  /**
   * Display chai assertion error
   */
  private async displayAssertionError(error: any) {
    /**
     * Display diff
     */
    console.log()
    console.log(`  Assertion Error: ${error.message}`)
    console.log()

    if (error.showDiff) {
      const { actual, expected } = error
      const diff = jestDiff(expected, actual, {
        expand: true,
        includeChangeCounts: true,
        compareKeys: () => 0, // Preserves keys order
      })
      console.log(diff)
    }

    /**
     * Display error stack with the main frame only
     */
    const jsonResponse = await this.getYouchJson(error)
    console.log(
      forTerminal(jsonResponse, {
        prefix: '  ',
        hideErrorTitle: true,
        hideMessage: true,
        displayShortPath: true,
        displayMainFrameOnly: true,
      })
    )
  }

  /**
   * Display jest assertion error
   */
  private async displayJestError(error: any) {
    /**
     * Display diff
     */
    console.log()
    console.log(
      `  Assertion Error:${error.message
        .split(EOL)
        .map((line: string) => `  ${line}`)
        .join(EOL)}`
    )
    console.log()

    /**
     * Display error stack with the main frame only
     */
    const jsonResponse = await this.getYouchJson(error)
    console.log(
      forTerminal(jsonResponse, {
        prefix: '  ',
        hideErrorTitle: true,
        hideMessage: true,
        displayShortPath: true,
        displayMainFrameOnly: true,
      })
    )
  }

  /**
   * Pretty print the error to the console
   */
  public async printError(error: any) {
    /**
     * Values are not object objects are printed as it is.
     */
    if (error === null || Array.isArray(error) || typeof error !== 'object') {
      console.log(`Error: ${error}`)
      return
    }

    if ('actual' in error && 'expected' in error) {
      await this.displayAssertionError(error)
      return
    }

    if ('matcherResult' in error) {
      await this.displayJestError(error)
      return
    }

    await this.displayErrorStack(error)
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
