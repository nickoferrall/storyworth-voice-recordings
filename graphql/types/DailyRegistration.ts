import { objectType } from 'nexus'

export const DailyRegistration = objectType({
  name: 'DailyRegistration',
  definition(t) {
    t.nonNull.string('date')
    t.nonNull.int('count')
    t.nonNull.int('cumulativeCount')
  },
})
