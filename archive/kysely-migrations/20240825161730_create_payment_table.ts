import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the Payment table
    await pg.schema
      .createTable('Payment')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('registrationId', 'uuid', (col) => col.notNull().unique())
      .addColumn('paymentIntentId', 'varchar(255)', (col) => col.notNull())
      .addColumn('amount', 'int4', (col) => col.notNull())
      .addColumn('currency', 'varchar(255)', (col) => col.notNull())
      .addColumn('status', 'varchar(255)', (col) => col.notNull())
      .addColumn('userId', 'uuid', (col) => col.notNull())
      .addColumn('customerId', 'varchar(255)', (col) => col.notNull())
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addForeignKeyConstraint(
        'fk_payment_registrationId',
        ['registrationId'],
        'Registration',
        ['id'],
        (constraint) => constraint.onDelete('cascade'),
      )
      .addForeignKeyConstraint(
        'fk_payment_userId',
        ['userId'],
        'User',
        ['id'],
        (constraint) => constraint.onDelete('cascade'),
      )
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop the Payment table
  await pg.schema.dropTable('Payment').ifExists().execute()
}
