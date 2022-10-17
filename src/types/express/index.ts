import { DocumentType } from "@typegoose/typegoose";
import { User } from "models/user.model";

declare module "express-serve-static-core" {
    interface Request {
        user?: DocumentType<User>;
    }
}

export default "this is a module";
