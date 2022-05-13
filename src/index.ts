import "dotenv/config";
import validateEnv from "./utils/validateEnv";
import App from "./app";
import logger from "./utils/logger";

process.on("uncaughtException", (err) => {
    logger("fatal", "Uncaught Exception", err);
    logger("info", "Shutting down...");
    process.exit(1);
});

validateEnv();

export const app = new App(Number(process.env.PORT));

export const server = app.listen();

process.on("unhandledRejection", (err: Error) => {
    logger("fatal", "Unhandled Rejection:", err);
    logger("info", "Shutting down...");
    server.close(() => {
        process.exit(1);
    });
});
