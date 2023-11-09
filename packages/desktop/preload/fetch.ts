import http from "node:http";
import https from "node:https";

export const protocols: Record<string, typeof http.request> = {
  "https:": https.request,
  "http:": http.request
};

function convertRawHeadersToHeadersInit(rawHeaders: string[]) {
  const headers: [ string, string ][] = [];

  for (const i of Array(rawHeaders.length / 2).fill(null).map((v, i) => i)) {
    const index = i * 2;

    const key = rawHeaders[index];
    const value = rawHeaders[index + 1];

    headers.push([ key, value ]);
  };

  return headers;
};

interface RequestInput {
  headers: Record<string, string>,
  method: string,
  body: ReadableStream<Uint8Array> | null,
  url: string,
  controller: ReturnType<NonNullable<typeof window.VXNative>["util"]["AbortController"]>
};

export function fetch(input: RequestInput) {
  const url = new URL(input.url);

  const request = protocols[url.protocol];
  if (!request) return Promise.reject(`Fetch API cannot load ${url.href}. URL scheme "${url.protocol.slice(0, url.protocol.length - 1)}" is not supported.`);

  return new Promise<[ Buffer, [ string, string ][], number, string ]>(async (resolve, reject) => {
    const options: http.RequestOptions = {
      headers: input.headers, 
      method: input.method
    };

    const ret = request((url as URL).href, options, (response) => {
      let ended = false;

      if (input.controller.aborted()) {
        reject("The user aborted a request.");
        return;
      };
      input.controller.addEventListener("abort", () => {
        reject("The user aborted a request.");

        if (ended) return;

        response.destroy();
        ended = true;
      });

      const chunks: Buffer[] = [];
      let size = 0;

      response.on("data", (chunk) => {
        if (!Buffer.isBuffer(chunk)) chunk = Buffer.from(chunk, "binary");
        chunks.push(chunk);
        size += chunk.length;
      });

      response.on("end", () => {
        const data = Buffer.concat(chunks, size);
        
        resolve([
          data,
          convertRawHeadersToHeadersInit(response.rawHeaders),
          response.statusCode!,
          response.statusMessage!
        ]);
        
        ended = true;
      });
      response.on("error", () => {
        reject("Unable to fetch");
      });
    });

    if (!input.controller.aborted() && input.body) {
      const res = new Response(input.body);
      const buffer = await res.arrayBuffer();
      
      ret.write(Buffer.from(buffer));
    };

    ret.end();
  });
};
