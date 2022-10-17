import { Application } from "express";
import healthcheckRouter from "./healthcheck.routes";
import authRoutes from "./auth.routes";
import authorRoutes from "./author.routes";
import userRoutes from "./user.routes";
import postRoutes from "./post.routes";

const apiURL = `/api/v${process.env.API_VERSION}`;

const apiRouters = [
    healthcheckRouter,
    authRoutes,
    authorRoutes,
    userRoutes,
    postRoutes,
];

const useRoutes = (app: Application): void => {
    apiRouters.forEach((apiRouter) => {
        app.use(`${apiURL}/${apiRouter.path}`, apiRouter.router);
    });
};

export { useRoutes };
