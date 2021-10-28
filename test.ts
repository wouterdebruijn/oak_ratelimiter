import { Application } from "https://deno.land/x/oak@v9.0.1/mod.ts"

import { RateLimiter } from "./ratelimiter.ts"

const rateLimiter = new RateLimiter({
    amount: 10,
    interval: 60,
    onDeny: ({response}, log) => {
        response.body = "Request was rate limited. Maximum requests: " + log.amount;
    }
})

const app = new Application();

app.use(rateLimiter.middleware);

app.use((ctx) => {
  ctx.response.body = "Hello world!";
});

await app.listen({ port: 8000 });