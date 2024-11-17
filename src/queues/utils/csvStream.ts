import { MAX_FILE_SIZE } from "@/consts";

import { Readable } from "stream";
import { pipeline } from "stream/promises";
import parser from "csv-parser";

// Rewrote this because I wasn't convinced it was streaming correctly
// I generated it originally but didn't fully understand the flow
const fetchCSVStream = async (
  url: string,
  status: { bytesRead: number } = { bytesRead: 0 },
): Promise<Readable> => {
  const headers = MAX_FILE_SIZE ? { Range: `bytes=0-${MAX_FILE_SIZE}` } : {};
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error("Failed to fetch the file");
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Failed to get reader from response body");

  const decoder = new TextDecoder();
  const stream = new Readable({
    read() {},
  });

  const pump = async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          stream.push(null);
          break;
        }
        status.bytesRead += value.length;

        const chunk = decoder.decode(value, { stream: true });
        stream.push(chunk);
      }
    } catch (error) {
      stream.emit("error", error);
    }
  };

  pump();
  return stream;
};

type TDownloadStatus = {
  totalBytes: number;
  bytesRead: number;
};

type onRowMethod = (
  row: Record<string, unknown>,
  percentComplete?: number,
) => Promise<void>;

const parseCSV = async (
  stream: Readable,
  onRow: onRowMethod,
  downloadStatus: TDownloadStatus,
): Promise<void> => {
  const transformStream = parser();

  transformStream.on("data", async (row) => {
    const { totalBytes, bytesRead } = downloadStatus;
    const percentComplete =
      totalBytes && bytesRead
        ? Math.round((bytesRead / totalBytes) * 100)
        : undefined;

    await onRow(row, percentComplete);
  });

  return await pipeline(stream, transformStream);
};

export const csvStream = async (
  url: string,
  rowCallback: onRowMethod,
): Promise<void> => {
  const response = await fetch(url, { method: "HEAD" });
  const totalBytes = parseInt(response.headers.get("content-length"), 10);
  const status = { totalBytes, bytesRead: 0 };

  const stream = await fetchCSVStream(url, status);

  try {
    await parseCSV(stream, rowCallback, status);
  } catch (error) {
    console.error("Error processing CSV", error);
    throw error;
  }
};
