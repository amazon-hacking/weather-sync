ALTER TABLE "gold"."air_quality" RENAME TO "air_quality_data";--> statement-breakpoint
ALTER TABLE "gold"."data_source" RENAME TO "data_sources";--> statement-breakpoint
ALTER TABLE "gold"."weather" RENAME TO "weather_data";--> statement-breakpoint
ALTER TABLE "gold"."air_quality_data" DROP CONSTRAINT "air_quality_place_id_places_id_fk";
--> statement-breakpoint
ALTER TABLE "gold"."air_quality_data" DROP CONSTRAINT "air_quality_source_id_data_source_id_fk";
--> statement-breakpoint
ALTER TABLE "gold"."pollutants" DROP CONSTRAINT "pollutants_source_id_data_source_id_fk";
--> statement-breakpoint
ALTER TABLE "gold"."sensors" DROP CONSTRAINT "sensors_source_id_data_source_id_fk";
--> statement-breakpoint
ALTER TABLE "gold"."weather_data" DROP CONSTRAINT "weather_place_id_places_id_fk";
--> statement-breakpoint
ALTER TABLE "gold"."weather_data" DROP CONSTRAINT "weather_source_id_data_source_id_fk";
--> statement-breakpoint
ALTER TABLE "gold"."air_quality_data" ADD CONSTRAINT "air_quality_data_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "gold"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold"."air_quality_data" ADD CONSTRAINT "air_quality_data_source_id_data_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "gold"."data_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold"."pollutants" ADD CONSTRAINT "pollutants_source_id_data_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "gold"."data_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold"."sensors" ADD CONSTRAINT "sensors_source_id_data_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "gold"."data_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold"."weather_data" ADD CONSTRAINT "weather_data_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "gold"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold"."weather_data" ADD CONSTRAINT "weather_data_source_id_data_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "gold"."data_sources"("id") ON DELETE no action ON UPDATE no action;