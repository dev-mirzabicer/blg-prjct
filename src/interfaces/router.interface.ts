import { Router } from "express";

interface ApiRouter {
    path: string;
    router: Router;
}

export default ApiRouter;
