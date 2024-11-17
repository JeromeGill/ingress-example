import { MigrationInterface, QueryRunner } from "typeorm";

export class TripRecord1732451170812 implements MigrationInterface {
  name = "TripRecord1732451170812";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "trip_record" ("id" SERIAL NOT NULL, "hvfhs_license_num" character varying(10), "dispatching_base_num" character varying(10), "originating_base_num" character varying(10), "request_datetime" TIMESTAMP, "on_scene_datetime" TIMESTAMP, "pickup_datetime" TIMESTAMP, "dropoff_datetime" TIMESTAMP, "PULocationID" character varying(10), "DOLocationID" character varying(10), "trip_miles" double precision, "trip_time" integer, "base_passenger_fare" double precision, "tolls" double precision, "bcf" double precision, "sales_tax" double precision, "congestion_surcharge" double precision, "airport_fee" double precision, "tips" double precision, "driver_pay" double precision, "shared_request_flag" character varying(1), "shared_match_flag" character varying(1), "access_a_ride_flag" character varying(1), "wav_request_flag" character varying(1), "wav_match_flag" character varying(1), CONSTRAINT "PK_0eda89e980fbc936fc77cfef17b" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "trip_record"`);
  }
}
