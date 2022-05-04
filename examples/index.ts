import expect from 'expect'
import { Assert } from '@japa/assert'
import { ErrorsPrinter } from '../index'

const printer = new ErrorsPrinter()

async function printStack() {
  await printer.printError(new Error('boom'))
}

async function printDiff() {
  try {
    new Assert().deepEqual({ id: 1 }, { id: 2 })
  } catch (error) {
    await printer.printError(error)
  }
}

async function printJestDiff() {
  try {
    expect({ bar: 'baz' }).toEqual(expect.not.objectContaining({ bar: 'baz' }))
  } catch (error) {
    await printer.printError(error)
  }
}

async function printErrors() {
  await printer.printError('boom')
  await printer.printError(['boom'])
  await printer.printError(null)
  await printer.printError(undefined)
  await printer.printError('{message: boom}')
}

printStack().then(printDiff).then(printJestDiff).then(printErrors)
