import { scalarType } from 'nexus'
import { Kind } from 'graphql'

export const DateTime = scalarType({
  name: 'DateTime',
  asNexusMethod: 'dateTime',
  description: 'Date and time',
  parseValue(value: unknown) {
    if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
      return new Date(value)
    }
    throw new Error('Invalid value type')
  },
  serialize(value: unknown) {
    const dateValue = value as Date | string | number
    if (dateValue instanceof Date) {
      return dateValue.toISOString()
    }
    return new Date(dateValue).toISOString()
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value)
    }
    return null
  },
})
