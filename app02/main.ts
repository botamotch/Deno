import { readFileStr } from "https://deno.land/std/fs/read_file_str.ts";
import { serve } from "https://deno.land/std@0.53.0/http/server.ts";

const s = serve({ port: 8000 });

console.log(`HTTP server listening on http://localhost:8000`)

for await (const req of s) {
  req.respond({ body: "Hello World\n" });
}
