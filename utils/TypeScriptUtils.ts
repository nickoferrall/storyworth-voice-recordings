import { Generated } from 'kysely'

type Timestamp = string // Assuming Timestamp is represented as a string

// Utility type to recursively remove `Generated<T>`
type RemoveGenerated<T> = T extends Generated<infer U> ? U : T

// Utility type to handle conversion of `Generated<Timestamp>` to `Date`
type ConvertTimestamp<T> = T extends Timestamp ? Date : T

// Recursive `Selectable` type that converts fields in an object
export type Selectable<T> = {
  [P in keyof T]: T[P] extends object
    ? Selectable<RemoveGenerated<ConvertTimestamp<T[P]>>>
    : RemoveGenerated<ConvertTimestamp<T[P]>>
}
