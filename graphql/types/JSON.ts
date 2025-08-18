import { Kind, ASTNode } from 'graphql'
import { scalarType } from 'nexus'

const parseLiteral = (ast: ASTNode): any => {
  switch (ast.kind) {
    case Kind.STRING:
      return ast.value
    case Kind.BOOLEAN:
      return ast.value
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value)
    case Kind.OBJECT: {
      const value = Object.create(null)
      ast.fields.forEach((field: any) => {
        value[field.name.value] = parseLiteral(field.value)
      })
      return value
    }
    case Kind.LIST:
      return ast.values.map(parseLiteral)
    default:
      return null
  }
}

export const Json = scalarType({
  name: 'Json',
  asNexusMethod: 'json', // 1
  description: 'Json custom scalar type',
  parseValue(value: any) {
    return value // value from the client input variables
  },
  serialize(value: any) {
    return value // value sent to the client
  },
  parseLiteral,
})
