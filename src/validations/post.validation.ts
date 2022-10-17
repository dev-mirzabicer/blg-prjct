import Joi from "joi";
import { Validation } from "../interfaces";

const ANALYTICS_QUERY = {
    likesRatio: Joi.string().regex(/^\d+$/), //numeric
    savesRatio: Joi.string().regex(/^\d+$/),
    freshness: Joi.string().regex(/^\d+$/),
    trending: Joi.string().regex(/^\d+$/),
    readTimeScore: Joi.string().regex(/^\d+$/),
    relation: Joi.string().regex(/^\d+$/),
    fields: Joi.string(),
};

const postValidation = new Validation({
    title: Joi.string().required(),
    description: Joi.string().required(),
    content: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
    categories: Joi.array().items(Joi.string()).required(),
});

postValidation.more = {
    like: {
        params: postValidation.idParams.required(),
    },
    save: {
        params: postValidation.idParams.required(),
    },
    unlike: {
        params: postValidation.idParams.required(),
    },
    unsave: {
        params: postValidation.idParams.required(),
    },
    getLikes: {
        params: postValidation.idParams.required(),
    },
    getSaves: {
        params: postValidation.idParams.required(),
    },
    read: {
        params: postValidation.idParams.required(),
        body: Joi.object().keys({
            percent: Joi.number().min(0).max(100),
            duration: Joi.number().min(0),
            leftOff: Joi.number().min(0).max(100),
        }),
    },
    getRead: {
        params: postValidation.idParams.required(),
    },
    // seeFeed: {
    //     body: Joi.object().keys(ANALYTICS_QUERY),
    // },
    getNewFeed: {
        query: Joi.object().keys({
            shown: Joi.string().regex(/^\d+$/),
        }),
    },
    getRestFeed: {
        query: Joi.object().keys({
            shown: Joi.string().regex(/^\d+$/),
        }),
    },
};

postValidation.getOne.query = Joi.object().keys(ANALYTICS_QUERY);

postValidation.addQueryForMany({
    date: Joi.string(),
    author: Joi.string(),
    //⬇ these are strings because in the raw request query form they look like { categories: "[\"...\", \"...\"]" }
    categories: Joi.string(),
    tags: Joi.string(),
});

export default postValidation;
