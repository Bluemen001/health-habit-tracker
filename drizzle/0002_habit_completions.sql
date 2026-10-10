CREATE TABLE `habit_completions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `habit_id` integer NOT NULL,
  `completed_date` text NOT NULL,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `habit_completions_habit_date_unique`
ON `habit_completions` (`habit_id`, `completed_date`);
