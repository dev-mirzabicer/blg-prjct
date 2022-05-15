import express, { Application } from "express";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import compression from "compression";
import bodyParser from "body-parser";
import logger from "./utils/logger";
import { errorHandler } from "./middlewares";
import { useRoutes } from "./routes";
import ApiError from "./utils/apiError";
import { Server } from "http";

class App {
    public express: Application;
    public port: number;

    constructor(port: number) {
        this.express = express();
        this.port = port;

        this.initMiddlewares();
        this.route();
        this.handleError();
        this.connectDb();
    }

    private initMiddlewares(): void {
        this.express.use(helmet());
        this.express.use(cors());
        this.express.use(compression());
        this.express.use(morgan("dev"));
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(bodyParser.json());
        this.express.use(cookieParser());
        this.express.use(mongoSanitize());
        this.express.use(hpp());
    }

    private connectDb(): void {
        const mongoUri = process.env.MONGO_URI?.replace(
            "<PASSWORD>",
            process.env.MONGO_PASSWORD || ""
        ) as string;
        mongoose
            .connect(mongoUri)
            .then(() => {
                logger("info", "Connected to MongoDB");
            })
            .catch((err) => {
                logger("fatal", "Error connecting to MongoDB: ", err);
                process.exit(1);
            });
    }

    private handleError(): void {
        this.express.use(errorHandler);
    }

    private route(): void {
        useRoutes(this.express);
        this.express.all("*", (req, res, next) => {
            next(new ApiError("Page not found.", 404));
        });
    }

    public listen(): Server {
        return this.express.listen(this.port, () => {
            logger("info", `Server listening on port ${this.port}`);
        });
    }

    public quit(): void {
        mongoose.disconnect();
    }
}

export default App;
