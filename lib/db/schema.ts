import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const mois = sqliteTable('mois', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  annee: integer('annee').notNull(),
  mois: integer('mois').notNull(),
  balance_reportee: real('balance_reportee').notNull().default(0),
  cree_le: integer('cree_le', { mode: 'timestamp' })
    .notNull().$defaultFn(() => new Date()),
}, (table) => ({
  moisUniqueIdx: uniqueIndex('mois_annee_mois_unique').on(table.annee, table.mois),
}));

export const depenses = sqliteTable('depenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mois_id: integer('mois_id').notNull()
    .references(() => mois.id, { onDelete: 'cascade' }),
  categorie: text('categorie').notNull(),
  sous_categorie: text('sous_categorie').notNull(),
  paye_par: text('paye_par').notNull(),
  montant: real('montant').notNull(),
  label: text('label'),
  date_depense: integer('date_depense', { mode: 'timestamp' }).notNull(),
  cree_le: integer('cree_le', { mode: 'timestamp' })
    .notNull().$defaultFn(() => new Date()),
});

export const ajustements = sqliteTable('ajustements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mois_id: integer('mois_id').notNull()
    .references(() => mois.id, { onDelete: 'cascade' }),
  de: text('de').notNull(),
  vers: text('vers').notNull(),
  montant: real('montant').notNull(),
  label: text('label').notNull(),
  date_ajustement: integer('date_ajustement', { mode: 'timestamp' }).notNull(),
  cree_le: integer('cree_le', { mode: 'timestamp' })
    .notNull().$defaultFn(() => new Date()),
});
