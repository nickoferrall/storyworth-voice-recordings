import fs from 'fs'
import csv from 'csv-parser'
import getKysely from '../src/db'

interface Transaction {
  id: string
  'Created date (UTC)': string
  'Customer Email': string
  Amount: string
  Currency: string
  Status: string
  Fee: string
  'Taxes On Fee': string
}

interface TransactionResult {
  email: string
  amount: string
  fee: string
  netAmount: string
  currency: string
  transactionDate: string
  competitionName: string
  competitionId: string
  orgName: string
  matchType:
    | 'Direct Match'
    | 'Multiple Comps (Date Match)'
    | 'Manual Override'
    | 'Unmatched'
}

async function analyzeTransactionsWithFees() {
  const pg = getKysely()
  const transactions: Transaction[] = []

  console.log('📊 Reading transactions CSV with fee analysis...')

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream('./transactions.csv')
      .pipe(csv())
      .on('data', (row: Transaction) => {
        if (row.Status === 'Paid' && row['Customer Email']) {
          transactions.push(row)
        }
      })
      .on('end', resolve)
      .on('error', reject)
  })

  console.log(`💳 Found ${transactions.length} paid transactions`)

  const emails = [...new Set(transactions.map((t) => t['Customer Email']))]
  console.log(`👥 Unique emails: ${emails.length}`)

  // Get user-competition relationships
  const userCompetitions = await pg
    .selectFrom('UserProfile')
    .innerJoin('AthleteCompetition', 'AthleteCompetition.userId', 'UserProfile.id')
    .innerJoin('Competition', 'Competition.id', 'AthleteCompetition.competitionId')
    .select([
      'UserProfile.email',
      'Competition.id as competitionId',
      'Competition.name as competitionName',
      'Competition.orgName',
      'AthleteCompetition.createdAt as joinedAt',
    ])
    .where('UserProfile.email', 'in', emails)
    .execute()

  console.log(`🏆 Found ${userCompetitions.length} user-competition relationships`)

  // Get competition info for manual overrides
  const fortCrossFit = await pg
    .selectFrom('Competition')
    .select(['id', 'name', 'orgName'])
    .where('name', 'ilike', '%FORT FEST 2025- CrossFit%')
    .executeTakeFirst()

  const dublinPlayoffs = await pg
    .selectFrom('Competition')
    .select(['id', 'name', 'orgName'])
    .where('id', '=', 'gg1r2d')
    .executeTakeFirst()

  const amsterdamPlayoffs = await pg
    .selectFrom('Competition')
    .select(['id', 'name', 'orgName'])
    .where('id', '=', 'iv1ZVN')
    .executeTakeFirst()

  // Manual overrides for unmatched transactions
  const manualOverrides = new Map<
    string,
    { competitionId: string; competitionName: string; orgName: string }
  >()

  if (fortCrossFit) {
    const fortMapping = {
      competitionId: fortCrossFit.id,
      competitionName: fortCrossFit.name,
      orgName: fortCrossFit.orgName || '',
    }
    manualOverrides.set('lindamarchlewski@gmail.com', fortMapping)
    manualOverrides.set('nateffemey@gmail.com', fortMapping)
  }

  if (dublinPlayoffs) {
    const dublinMapping = {
      competitionId: dublinPlayoffs.id,
      competitionName: dublinPlayoffs.name,
      orgName: dublinPlayoffs.orgName || '',
    }
    manualOverrides.set('Thnaidoo@gmail.com', dublinMapping)
  }

  if (amsterdamPlayoffs) {
    const amsterdamMapping = {
      competitionId: amsterdamPlayoffs.id,
      competitionName: amsterdamPlayoffs.name,
      orgName: amsterdamPlayoffs.orgName || '',
    }
    manualOverrides.set('ailbhe604@hotmaiñ.com', amsterdamMapping)
  }

  // Group user competitions by email
  const userCompMap = new Map<string, typeof userCompetitions>()
  userCompetitions.forEach((uc) => {
    if (!userCompMap.has(uc.email)) {
      userCompMap.set(uc.email, [])
    }
    userCompMap.get(uc.email)!.push(uc)
  })

  const results: TransactionResult[] = []
  const analysis = {
    totalTransactions: transactions.length,
    matched: 0,
    multipleComps: 0,
    manualOverrides: 0,
    unmatched: 0,
    totalGrossRevenue: 0,
    totalFees: 0,
    totalNetRevenue: 0,
    byCompetition: {} as Record<
      string,
      {
        count: number
        grossRevenue: number
        fees: number
        netRevenue: number
        currency: string
        avgFeeRate: number
      }
    >,
  }

  // Process each transaction
  transactions.forEach((tx) => {
    const email = tx['Customer Email']
    const txDate = new Date(tx['Created date (UTC)'])
    const amount = parseFloat(tx.Amount)
    const fee = parseFloat(tx.Fee || '0')
    const netAmount = amount - fee

    // Track overall totals
    analysis.totalGrossRevenue += amount
    analysis.totalFees += fee
    analysis.totalNetRevenue += netAmount

    // Check for manual override first
    const manualOverride = manualOverrides.get(email)
    if (manualOverride) {
      analysis.manualOverrides++
      results.push({
        email,
        amount: tx.Amount,
        fee: tx.Fee || '0',
        netAmount: netAmount.toFixed(2),
        currency: tx.Currency,
        transactionDate: tx['Created date (UTC)'],
        competitionName: manualOverride.competitionName,
        competitionId: manualOverride.competitionId,
        orgName: manualOverride.orgName,
        matchType: 'Manual Override',
      })

      const compKey = manualOverride.competitionName
      if (!analysis.byCompetition[compKey]) {
        analysis.byCompetition[compKey] = {
          count: 0,
          grossRevenue: 0,
          fees: 0,
          netRevenue: 0,
          currency: tx.Currency,
          avgFeeRate: 0,
        }
      }
      analysis.byCompetition[compKey].count++
      analysis.byCompetition[compKey].grossRevenue += amount
      analysis.byCompetition[compKey].fees += fee
      analysis.byCompetition[compKey].netRevenue += netAmount
      return
    }

    const userComps = userCompMap.get(email)
    if (!userComps || userComps.length === 0) {
      analysis.unmatched++
      results.push({
        email,
        amount: tx.Amount,
        fee: tx.Fee || '0',
        netAmount: netAmount.toFixed(2),
        currency: tx.Currency,
        transactionDate: tx['Created date (UTC)'],
        competitionName: 'UNMATCHED',
        competitionId: '',
        orgName: '',
        matchType: 'Unmatched',
      })
      return
    }

    let selectedComp
    let matchType: TransactionResult['matchType']

    if (userComps.length === 1) {
      selectedComp = userComps[0]
      matchType = 'Direct Match'
      analysis.matched++
    } else {
      selectedComp = userComps.reduce((closest, current) => {
        const currentDiff = Math.abs(
          txDate.getTime() - new Date(current.joinedAt).getTime(),
        )
        const closestDiff = Math.abs(
          txDate.getTime() - new Date(closest.joinedAt).getTime(),
        )
        return currentDiff < closestDiff ? current : closest
      })
      matchType = 'Multiple Comps (Date Match)'
      analysis.multipleComps++
    }

    results.push({
      email,
      amount: tx.Amount,
      fee: tx.Fee || '0',
      netAmount: netAmount.toFixed(2),
      currency: tx.Currency,
      transactionDate: tx['Created date (UTC)'],
      competitionName: selectedComp.competitionName,
      competitionId: selectedComp.competitionId,
      orgName: selectedComp.orgName || '',
      matchType,
    })

    const compKey = selectedComp.competitionName
    if (!analysis.byCompetition[compKey]) {
      analysis.byCompetition[compKey] = {
        count: 0,
        grossRevenue: 0,
        fees: 0,
        netRevenue: 0,
        currency: tx.Currency,
        avgFeeRate: 0,
      }
    }
    analysis.byCompetition[compKey].count++
    analysis.byCompetition[compKey].grossRevenue += amount
    analysis.byCompetition[compKey].fees += fee
    analysis.byCompetition[compKey].netRevenue += netAmount
  })

  // Calculate average fee rates
  Object.values(analysis.byCompetition).forEach((comp) => {
    comp.avgFeeRate = comp.grossRevenue > 0 ? (comp.fees / comp.grossRevenue) * 100 : 0
  })

  // Print results
  console.log('\n📋 TRANSACTION ANALYSIS WITH FEES')
  console.log('===================================')
  console.log(`💳 Total transactions: ${analysis.totalTransactions}`)
  console.log(`✅ Direct matches: ${analysis.matched}`)
  console.log(`🔀 Multiple comps (date matched): ${analysis.multipleComps}`)
  console.log(`🛠️  Manual overrides: ${analysis.manualOverrides}`)
  console.log(`❌ Still unmatched: ${analysis.unmatched}`)

  console.log('\n💰 REVENUE SUMMARY:')
  console.log(`💳 Total Gross Revenue: ${analysis.totalGrossRevenue.toFixed(2)}`)
  console.log(`🏧 Total Stripe Fees: ${analysis.totalFees.toFixed(2)}`)
  console.log(`💰 Total Net Revenue: ${analysis.totalNetRevenue.toFixed(2)}`)
  console.log(
    `📊 Average Fee Rate: ${((analysis.totalFees / analysis.totalGrossRevenue) * 100).toFixed(2)}%`,
  )

  console.log('\n🏆 REVENUE BY COMPETITION (WITH FEES):')
  const sortedComps = Object.entries(analysis.byCompetition).sort(
    ([, a], [, b]) => b.netRevenue - a.netRevenue,
  )

  sortedComps.forEach(([compName, data]) => {
    console.log(`${compName}:`)
    console.log(`  📊 ${data.count} registrations`)
    console.log(`  💳 Gross: ${data.grossRevenue.toFixed(2)} ${data.currency}`)
    console.log(
      `  🏧 Fees: ${data.fees.toFixed(2)} ${data.currency} (${data.avgFeeRate.toFixed(2)}%)`,
    )
    console.log(`  💰 Net: ${data.netRevenue.toFixed(2)} ${data.currency}`)
    console.log('')
  })

  // Still unmatched
  const stillUnmatched = results.filter((r) => r.matchType === 'Unmatched')
  if (stillUnmatched.length > 0) {
    console.log('❌ STILL UNMATCHED:')
    stillUnmatched.forEach((r) => {
      console.log(`${r.email} - ${r.amount} ${r.currency} (fee: ${r.fee})`)
    })
  }

  // Write detailed CSV
  console.log('\n📄 Writing results to CSV...')
  const csvHeader =
    'Email,Gross Amount,Stripe Fee,Net Amount,Currency,Transaction Date,Competition Name,Competition ID,Organizer,Match Type\n'
  const csvRows = results
    .map(
      (r) =>
        `"${r.email}","${r.amount}","${r.fee}","${r.netAmount}","${r.currency}","${r.transactionDate}","${r.competitionName}","${r.competitionId}","${r.orgName}","${r.matchType}"`,
    )
    .join('\n')

  fs.writeFileSync('./transaction-analysis-with-fees.csv', csvHeader + csvRows)
  console.log('✅ Detailed results saved to: transaction-analysis-with-fees.csv')

  // Write competition summary with fees
  const summaryHeader =
    'Competition Name,Registrations,Gross Revenue,Stripe Fees,Net Revenue,Currency,Avg Fee Rate %\n'
  const summaryRows = sortedComps
    .map(
      ([name, data]) =>
        `"${name}","${data.count}","${data.grossRevenue.toFixed(2)}","${data.fees.toFixed(2)}","${data.netRevenue.toFixed(2)}","${data.currency}","${data.avgFeeRate.toFixed(2)}%"`,
    )
    .join('\n')

  fs.writeFileSync('./competition-revenue-with-fees.csv', summaryHeader + summaryRows)
  console.log('✅ Fee summary saved to: competition-revenue-with-fees.csv')

  await pg.destroy()
}

analyzeTransactionsWithFees().catch(console.error)
