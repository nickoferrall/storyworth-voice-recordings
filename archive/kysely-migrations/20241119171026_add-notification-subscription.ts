import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the NotificationSubscription table
    await pg.schema
      .createTable('NotificationSubscription')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('email', 'varchar(255)', (col) => col.notNull())
      .addColumn('userId', 'uuid')
      .addColumn('eventType', 'varchar(255)')
      .addColumn('gender', 'varchar(255)')
      .addColumn('teamSize', 'varchar(255)')
      .addColumn('difficulty', 'varchar(255)')
      .addColumn('country', 'varchar(255)')
      .addColumn('location', 'varchar(255)')
      .addColumn('tags', sql`text[]`, (col) => col.defaultTo(sql`ARRAY[]::text[]`))
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .execute()

    // Create indexes
    await pg.schema
      .createIndex('idx_notification_subscription_email')
      .on('NotificationSubscription')
      .column('email')
      .execute()

    await pg.schema
      .createIndex('idx_notification_subscription_userId')
      .on('NotificationSubscription')
      .column('userId')
      .execute()

    await pg.schema
      .createIndex('idx_notification_subscription_gender')
      .on('NotificationSubscription')
      .column('gender')
      .execute()

    await pg.schema
      .createIndex('idx_notification_subscription_teamSize')
      .on('NotificationSubscription')
      .column('teamSize')
      .execute()

    await pg.schema
      .createIndex('idx_notification_subscription_difficulty')
      .on('NotificationSubscription')
      .column('difficulty')
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Drop indexes first
    await pg.schema.dropIndex('idx_notification_subscription_email').execute()
    await pg.schema.dropIndex('idx_notification_subscription_userId').execute()
    await pg.schema.dropIndex('idx_notification_subscription_gender').execute()
    await pg.schema.dropIndex('idx_notification_subscription_teamSize').execute()
    await pg.schema.dropIndex('idx_notification_subscription_difficulty').execute()

    // Drop the table
    await pg.schema.dropTable('NotificationSubscription').ifExists().execute()
  } catch (error) {
    console.error('Migration rollback failed:', error)
    throw error
  }
}
