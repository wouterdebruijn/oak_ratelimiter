import { Context, Middleware } from "https://deno.land/x/oak@v9.0.1/mod.ts"

export type onDeny = (ctx: Context, connectionlog: ConnectionLog) => void;

interface Config {
    interval: number;
    amount: number;
    onDeny: onDeny;
}

interface ConnectionLog {
    time: Date;
    amount: number;
}

export class RateLimiter {
    private interval;
    private amount;

    private onDeny;

    private connectionLogs = new Map<string, ConnectionLog>();

    constructor(config: Config) {
        this.interval = config.interval;
        this.amount = config.amount;
        this.onDeny = config.onDeny;
    }

    public middleware: Middleware = async (ctx, next) => {
        const connectionLog = this.connectionLogs.get(ctx.request.ip);

        if (typeof connectionLog == "undefined") {
            this.connectionLogs.set(ctx.request.ip, {
                amount: 1,
                time: new Date()
            })
        } else {
            if (connectionLog.time.getTime() < (new Date).getTime() - this.interval * 1000) {
                connectionLog.time = new Date();
                connectionLog.amount = 0;
            }

            if (connectionLog.amount >= this.amount) {
                this.onDeny(ctx, connectionLog);
                return;
            }
            
            connectionLog.amount ++;
            this.connectionLogs.set(ctx.request.ip, connectionLog);
        }

        await next()
    }
}