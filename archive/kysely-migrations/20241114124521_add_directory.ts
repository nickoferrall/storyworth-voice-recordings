import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>) {
  const pg = getKysely()
  // Create DirectoryCompType enum
  await sql`CREATE TYPE "DirectoryCompType" AS ENUM ('CROSSFIT', 'HYROX', 'HYROX_SIMULATION', 'OTHER')`.execute(
    pg,
  )

  // Directory Competition table
  await pg.schema
    .createTable('DirectoryComp')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey().notNull())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('teamSize', 'text')
    .addColumn('location', 'text', (col) => col.notNull())
    .addColumn('country', 'text', (col) => col.notNull())
    .addColumn('startDate', 'timestamptz', (col) => col.notNull())
    .addColumn('endDate', 'timestamptz')
    .addColumn('price', 'integer')
    .addColumn('currency', 'text')
    .addColumn('website', 'text')
    .addColumn('email', 'text')
    .addColumn('instagramHandle', 'text')
    .addColumn('logo', 'text')
    .addColumn('description', 'text')
    .addColumn('type', sql`"DirectoryCompType"`, (col) =>
      col.notNull().defaultTo(sql`'OTHER'`),
    )
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  // Create Difficulty enum if it doesn't exist
  await sql`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty') THEN
      CREATE TYPE "Difficulty" AS ENUM ('ELITE', 'EVERYDAY', 'INTERMEDIATE', 'MASTERS', 'RX', 'TEEN');
    END IF;
  END $$;`.execute(pg)

  // Category table
  await pg.schema
    .createTable('Category')
    .addColumn('id', 'text', (col) => col.primaryKey().notNull())
    .addColumn('directoryCompId', 'text', (col) =>
      col.references('DirectoryComp.id').onDelete('cascade').notNull(),
    )
    .addColumn('price', 'integer')
    .addColumn('gender', sql`"Gender"`, (col) => col.notNull())
    .addColumn('teamSize', 'integer', (col) => col.notNull())
    .addColumn('difficulty', sql`"Difficulty"`, (col) => col.notNull())
    .addColumn('isSoldOut', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('tags', sql`text[]`)
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updatedAt', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()
}

export async function down(db: Kysely<any>) {
  const pg = getKysely()
  await pg.schema.dropTable('Category').ifExists().execute()
  await pg.schema.dropTable('DirectoryComp').ifExists().execute()
  await sql`DROP TYPE IF EXISTS "DirectoryCompType"`.execute(pg)
}
