import Busboy from "busboy";
import { NextRequest } from "next/server";

export interface ParsedFormData {
  fields: Record<string, string>;
  files: Array<{
    fieldname: string;
    filename: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
  }>;
}

export async function parseFormData(
  request: NextRequest
): Promise<ParsedFormData> {
  return new Promise((resolve, reject) => {
    const contentType = request.headers.get("content-type");
    if (!contentType) {
      reject(new Error("No content-type header"));
      return;
    }

    const busboy = Busboy({ headers: { "content-type": contentType } });
    const fields: Record<string, string> = {};
    const files: ParsedFormData["files"] = [];

    busboy.on("file", (fieldname, file, info) => {
      const { filename, encoding, mimeType } = info;
      const chunks: Buffer[] = [];

      file.on("data", (chunk) => {
        chunks.push(chunk);
      });

      file.on("end", () => {
        files.push({
          fieldname,
          filename,
          encoding,
          mimetype: mimeType,
          buffer: Buffer.concat(chunks),
        });
      });
    });

    busboy.on("field", (fieldname, value) => {
      fields[fieldname] = value;
    });

    busboy.on("finish", () => {
      resolve({ fields, files });
    });

    busboy.on("error", (error) => {
      reject(error);
    });

    // Convert Request body to Node.js stream
    request.body?.pipeTo(
      new WritableStream({
        write(chunk) {
          busboy.write(chunk);
        },
        close() {
          busboy.end();
        },
        abort() {
          busboy.destroy();
        },
      })
    );
  });
}
