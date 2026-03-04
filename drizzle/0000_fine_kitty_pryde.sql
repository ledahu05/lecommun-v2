CREATE TABLE `ajustements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`mois_id` integer NOT NULL,
	`de` text NOT NULL,
	`vers` text NOT NULL,
	`montant` real NOT NULL,
	`label` text NOT NULL,
	`date_ajustement` integer NOT NULL,
	`cree_le` integer NOT NULL,
	FOREIGN KEY (`mois_id`) REFERENCES `mois`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `depenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`mois_id` integer NOT NULL,
	`categorie` text NOT NULL,
	`sous_categorie` text NOT NULL,
	`paye_par` text NOT NULL,
	`montant` real NOT NULL,
	`label` text,
	`date_depense` integer NOT NULL,
	`cree_le` integer NOT NULL,
	FOREIGN KEY (`mois_id`) REFERENCES `mois`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `mois` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`annee` integer NOT NULL,
	`mois` integer NOT NULL,
	`balance_reportee` real DEFAULT 0 NOT NULL,
	`cree_le` integer NOT NULL
);
