/*
 * @japa/errors-printer
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// @ts-ignore-error
import forTerminal from 'youch-terminal'

import Youch from 'youch'
import { EOL } from 'node:os'
import colors from '@poppinss/colors'
import { diff as jestDiff } from 'jest-diff'

const ansi = colors.ansi()
const { columns } = process.stdout

const pointer = process.platform === 'win32' && !process.env.WT_SESSION ? '>' : '❯'

/**
 * Pretty prints the test runner errors
 */
export class ErrorsPrinter {
  #options: {
    stackLinesCount: number
    framesMaxLimit: number
  }

  constructor(options?: { stackLinesCount?: number; framesMaxLimit?: number }) {
    this.#options = { stackLinesCount: 5, framesMaxLimit: 3, ...options }
  }

  /**
   * Get Youch's JSON report of the given error
   */
  async #getYouchJson(error: any) {
    const youch = new Youch(
      error,
      {},
      {
        postLines: this.#options.stackLinesCount,
        preLines: this.#options.stackLinesCount,
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
        framesMaxLimit: this.#options.framesMaxLimit,
        displayMainFrameOnly: false,
      }).trimEnd()
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

    if (!('showDiff' in error) || error.showDiff) {
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
      }).trimEnd()
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
      }).trimEnd()
    )
  }

  /**
   * Prints a section with heading and borders around it
   */
  printSectionBorder(paging: string) {
    const border = '─'.repeat(columns - (paging.length + 1))
    console.log(ansi.red(`${border}${paging}─`))
  }

  /**
   * Prints section header with a centered title and
   * borders around it
   */
  printSectionHeader(title: string) {
    const whitspacesWidth = (columns - title.length) / 2
    const [lhsWidth, rhsWidth] = Number.isInteger(whitspacesWidth)
      ? [whitspacesWidth, whitspacesWidth]
      : [whitspacesWidth - 1, whitspacesWidth + 1]

    const borderLeft = ansi.red('─'.repeat(lhsWidth - 1))
    const borderRight = ansi.red('─'.repeat(rhsWidth))
    console.log(`${borderLeft}${ansi.bgRed().black(` ${title} `)}${borderRight}`)
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
  async printErrors(errors: { title: string; phase: string; error: any }[]) {
    const errorsCount = errors.length
    let index = 0

    for (let { phase, error, title } of errors) {
      const label = phase === 'test' ? title : `${title}: ${this.#getPhaseTitle(phase)}`
      console.log()
      console.log(`  ${pointer} ${ansi.underline(label)}`)
      await this.printError(error)
      this.printSectionBorder(`[${++index}/${errorsCount}]`)
    }
  }
}
