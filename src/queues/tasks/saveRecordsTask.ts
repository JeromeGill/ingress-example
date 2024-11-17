import { TRIP_RECORD_PERSIST_CHUNK_SIZE } from "@/consts";
import { TripRecord } from "@/models/TripRecord.entity";
import { tripRecordRepository } from "@/services/TripRecord.service";

// We save records in batches in a separate task
export const saveRecordsTask = async (props: { records: TripRecord[] }) => {
  const { records } = props;

  await tripRecordRepository.save(records, {
    chunk: TRIP_RECORD_PERSIST_CHUNK_SIZE,
  });
  return `Saved ${records.length} records`;
};
