/*
 * @japa/errors-printer
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Youch from 'youch'
import { EOL } from 'node:os'
import { cliui } from '@poppinss/cliui'
import { diff as jestDiff } from 'jest-diff'
// @ts-ignore
import forTerminal from 'youch-terminal'

const { colors, icons } = cliui()

/**
 * Print test runner errors
 */
export class ErrorsPrinter {
  #stackLinesCount: number
  #framesMaxLimit: number

  constructor(options?: { stackLinesCount?: number; framesMaxLimit?: number }) {
    this.#stackLinesCount = options?.stackLinesCount || 5
    this.#framesMaxLimit = options?.framesMaxLimit || 3
  }

  /**
   * Get Youch's JSON report of the given error
   */
  async #getYouchJson(error: any) {
    const youch = new Youch(
      error,
      {},
      {
        postLines: this.#stackLinesCount,
        preLines: this.#stackLinesCount,
      }
    )
    return youch.toJSON()
  }

  /**
   * Returns human readable message for error phase
   */
  #getPhaseTitle(phase: string) {
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
  async #displayErrorStack(error: any) {
    const jsonResponse = await this.#getYouchJson(error)
    console.log(
      forTerminal(jsonResponse, {
        displayShortPath: true,
        framesMaxLimit: this.#framesMaxLimit,
        displayMainFrameOnly: false,
      })
    )
  }

  /**
   * Display chai assertion error
   */
  async #displayAssertionError(error: any) {
    /**
     * Display diff
     */
    console.log()
    console.log(`  Assertion Error: ${error.message}`)
    console.log()

    if (('showDiff' in error && error.showDiff) || ('actual' in error && 'expected' in error)) {
      const { actual, expected } = error
      const diff = jestDiff(expected, actual, {
        expand: true,
        includeChangeCounts: true,
      })
      console.log(diff)
    }

    /**
     * Display error stack with the main frame only
     */
    const jsonResponse = await this.#getYouchJson(error)
    console.log(
      forTerminal(jsonResponse, {
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
  async #displayJestError(error: any) {
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
    const jsonResponse = await this.#getYouchJson(error)
    console.log(
      forTerminal(jsonResponse, {
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
  async printError(error: any) {
    /**
     * Values are not object objects are printed as it is.
     */
    if (error === null || Array.isArray(error) || typeof error !== 'object') {
      console.log(`Error: ${error}`)
      return
    }

    if ('actual' in error && 'expected' in error) {
      await this.#displayAssertionError(error)
      return
    }

    if ('matcherResult' in error) {
      await this.#displayJestError(error)
      return
    }

    await this.#displayErrorStack(error)
  }

  /**
   * Print summary errors
   */
  async printErrors(label: string, errors: { phase: string; error: any }[]) {
    for (let { phase, error } of errors) {
      console.log(colors.red(`${icons.cross} ${label}`))
      if (phase !== 'test') {
        console.log(`  ${colors.red(`(${this.#getPhaseTitle(phase)})`)}`)
      }

      await this.printError(error)
      console.log()
    }
  }
}
