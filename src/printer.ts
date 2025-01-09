/*
 * @japa/errors-printer
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Youch } from 'youch'
import colors from '@poppinss/colors'
import supportsColor from 'supports-color'
import { diff as jestDiff } from 'jest-diff'
import { ParsedError } from 'youch/types'

const { columns } = process.stdout
const ansi = supportsColor.stdout ? colors.ansi() : colors.silent()
const pointer = process.platform === 'win32' && !process.env.WT_SESSION ? '>' : '❯'

/**
 * ErrorsPrinter exposes the API to pretty print errors occurred during
 * tests executed via Japa.
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
   * Parses the error stack using Youch
   */
  #parseErrorStack(error: any) {
    return new Youch().toJSON(error, {
      frameSourceBuffer: this.#options.stackLinesCount,
    })
  }

  /**
   * Parsers chai assertion error
   */
  async #parseAssertionError(error: any): Promise<ParsedError> {
    const parsedError = await this.#parseErrorStack(error)
    if (!('showDiff' in error) || error.showDiff) {
      console.error()
      const { actual, expected } = error
      const diff = jestDiff(expected, actual, {
        expand: true,
        includeChangeCounts: true,
      })
      parsedError.message = `${parsedError.message}\n${diff}`
    }

    return parsedError
  }

  /**
   * Displays the error stack for a given error
   */
  async #displayErrorStack(error: any) {
    const ansiOutput = await new Youch().toANSI(error, {
      frameSourceBuffer: this.#options.stackLinesCount,
    })
    console.error(ansiOutput.trimEnd())
  }

  /**
   * Display chai assertion error
   */
  async #displayAssertionError(error: any) {
    if (!('showDiff' in error) || error.showDiff) {
      console.error()
      const { actual, expected } = error
      const diff = jestDiff(expected, actual, {
        expand: true,
        includeChangeCounts: true,
      })
      console.error(diff)
    }

    /**
     * Pretty print error stack
     */
    await this.#displayErrorStack(error)
  }

  /**
   * Prints a section with heading and borders around it
   */
  printSectionBorder(paging: string) {
    const border = '─'.repeat(columns - (paging.length + 1))
    console.error(ansi.red(`${border}${paging}─`))
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
    console.error(`${borderLeft}${ansi.bgRed().black(` ${title} `)}${borderRight}`)
  }

  /**
   * Parses an error to JSON
   */
  async parseError(error: any): Promise<ParsedError | { message: string }> {
    /**
     * Values that are not object objects are not parsed
     */
    if (error === null || Array.isArray(error) || typeof error !== 'object') {
      return {
        message: String(error),
      }
    }

    /**
     * Assertion error
     */
    if ('actual' in error && 'expected' in error) {
      return this.#parseAssertionError(error)
    }

    /**
     * Parse all other errors using Youch
     */
    return this.#parseErrorStack(error)
  }

  /**
   * Pretty print the error to the console
   */
  async printError(error: any) {
    /**
     * Values that are not object objects are printed as it is.
     */
    if (error === null || Array.isArray(error) || typeof error !== 'object') {
      console.error(`Error: ${error}`)
      return
    }

    /**
     * Assertion error
     */
    if ('actual' in error && 'expected' in error) {
      await this.#displayAssertionError(error)
      return
    }

    /**
     * Print all other errors using Youch
     */
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
      console.error()
      console.error(`${pointer} ${ansi.underline(label)}`)
      await this.printError(error)
      this.printSectionBorder(`[${++index}/${errorsCount}]`)
    }
  }
}
