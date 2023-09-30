import { Application } from "$oak/mod.ts";
import { router } from "@/src/router.ts";

const app = new Application();

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

app.use(router.routes());

const PORT = 8000;

console.log(`Listening on http://localhost:${PORT}/`);

// await app.listen({ port: 8080, certFile: "../server.csr", keyFile: "../server.key" });
await app.listen({ port: PORT });
