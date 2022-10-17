import Joi from "joi";
import { Validation } from "../interfaces";
import objectId from "./validateMongoID";

const authorValidation = new Validation({
    user: Joi.string().custom(objectId).required(),
    bio: Joi.string().required(),
    socials: Joi.array().items(
        Joi.object().keys({
            name: Joi.string().required(),
            link: Joi.string().required(),
        })
    ),
});

authorValidation.more = {
    patchMe: {
        body: authorValidation.patch.body,
    },
    getMe: {
        query: authorValidation.getOne.query,
    },
};

export default authorValidation;
