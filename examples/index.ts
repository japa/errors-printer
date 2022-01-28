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

printStack().then(printDiff)
