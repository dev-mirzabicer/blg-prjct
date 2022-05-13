import { Application } from "express";
import healthcheckRouter from "./healthcheck.route";

const apiURL = `/api/v${process.env.API_VERSION}`;

const apiRouters = [healthcheckRouter];

const useRoutes = (app: Application): void => {
    apiRouters.forEach((apiRouter) => {
        app.use(`${apiURL}/${apiRouter.path}`, apiRouter.router);
    });
};

export { useRoutes };
