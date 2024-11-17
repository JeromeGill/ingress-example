import { dataSource } from "@/config/datasource";
import { TripRecord } from "@/models/TripRecord.entity";

export const tripRecordRepository = dataSource.getRepository(TripRecord);
