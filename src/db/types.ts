import { ColumnType } from 'kysely'

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string | null
  picture: string | null
  bio: string | null
  isSuperUser: boolean
  isVerified: boolean
  createdAt: ColumnType<Date, string | Date | undefined, string | Date>
  updatedAt: ColumnType<Date, string | Date | undefined, string | Date>
}

export interface DB {
  UserProfile: UserProfile
  // ... other tables
}
