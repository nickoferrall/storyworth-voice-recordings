#!/usr/bin/env ts-node

import path from 'path'
import { execSync } from 'child_process'

const runTest = async (testFile: string) => {
  try {
    console.log(`\n🧪 Running ${testFile}...`)
    execSync(`npx ts-node ${testFile}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    })
    console.log(`✅ ${testFile} passed`)
    return true
  } catch (error) {
    console.log(`❌ ${testFile} failed`)
    return false
  }
}

const main = async () => {
  console.log('🚀 Running Fitlo Test Suite\n')

  const testFiles = [
    'tests/security/auth.test.ts',
    'tests/business/partner-matching.test.ts',
    'tests/integration/auth.test.ts',
  ]

  let passed = 0
  let failed = 0

  for (const testFile of testFiles) {
    const result = await runTest(testFile)
    if (result) {
      passed++
    } else {
      failed++
    }
  }

  console.log('\n📊 Test Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📝 Total: ${passed + failed}`)

  if (failed > 0) {
    console.log('\n🚨 Some tests failed!')
    process.exit(1)
  } else {
    console.log('\n🎉 All tests passed!')
    process.exit(0)
  }
}

if (require.main === module) {
  main()
}
