// Simple test utilities for Node.js built-in testing
export const describe = (name: string, fn: () => void) => {
  console.log(`\n📋 ${name}`)
  fn()
}

export const beforeAll = (fn: () => void | Promise<void>) => {
  return fn()
}

export const afterAll = (fn: () => void | Promise<void>) => {
  return fn()
}

export const beforeEach = (fn: () => void | Promise<void>) => {
  return fn()
}

export const it = (name: string, fn: () => void | Promise<void>) => {
  try {
    const result = fn()
    if (result instanceof Promise) {
      return result
        .then(() => console.log(`  ✅ ${name}`))
        .catch((error) => {
          console.log(`  ❌ ${name}`)
          console.error(`     ${error.message}`)
          process.exit(1)
        })
    } else {
      console.log(`  ✅ ${name}`)
    }
  } catch (error: any) {
    console.log(`  ❌ ${name}`)
    console.error(`     ${error.message}`)
    process.exit(1)
  }
}

export const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, but got ${actual}`)
    }
  },
  toEqual: (expected: any) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`,
      )
    }
  },
  toBeTruthy: () => {
    if (!actual) {
      throw new Error(`Expected truthy value, but got ${actual}`)
    }
  },
  toBeFalsy: () => {
    if (actual) {
      throw new Error(`Expected falsy value, but got ${actual}`)
    }
  },
  toBeNull: () => {
    if (actual !== null) {
      throw new Error(`Expected null, but got ${actual}`)
    }
  },
  toContain: (expected: any) => {
    if (typeof actual === 'string' && !actual.includes(expected)) {
      throw new Error(`Expected "${actual}" to contain "${expected}"`)
    } else if (Array.isArray(actual) && !actual.includes(expected)) {
      throw new Error(`Expected array to contain ${expected}`)
    }
  },
  not: {
    toBe: (expected: any) => {
      if (actual === expected) {
        throw new Error(`Expected not to be ${expected}, but got ${actual}`)
      }
    },
    toEqual: (expected: any) => {
      if (JSON.stringify(actual) === JSON.stringify(expected)) {
        throw new Error(`Expected not to equal ${JSON.stringify(expected)}`)
      }
    },
    toThrow: (expectedError?: string) => {
      if (typeof actual !== 'function') {
        throw new Error('Expected a function for not.toThrow matcher')
      }
      try {
        actual()
        // If we get here, the function didn't throw, which is what we want for not.toThrow
      } catch (error: any) {
        throw new Error(`Expected function not to throw, but it threw: ${error.message}`)
      }
    },
  },
  toThrow: (expectedError?: string) => {
    if (typeof actual !== 'function') {
      throw new Error('Expected a function for toThrow matcher')
    }
    try {
      actual()
      throw new Error('Expected function to throw, but it did not')
    } catch (error: any) {
      if (expectedError && !error.message.includes(expectedError)) {
        throw new Error(
          `Expected error containing "${expectedError}", but got "${error.message}"`,
        )
      }
    }
  },
})
