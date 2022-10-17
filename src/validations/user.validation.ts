import { Validation } from "../interfaces";
import Joi from "joi";
import { JoiConstants, UserRole } from "../constants";

const userValidation = new Validation();

const userRolesJoi = Joi.string().valid(...Object.values(UserRole));

userValidation.more = {
    changeRole: {
        body: Joi.object().keys({
            role: userRolesJoi.required(),
        }),
        params: userValidation.idParams.required(),
    },
    patchMe: {
        body: Joi.object().keys({
            //username: ...
            password: JoiConstants.PASSWORD,
            avatar: Joi.string(), //maybe same for avatar? idk
            preferredTags: Joi.array().items(Joi.string()),
            preferredCategories: Joi.array().items(Joi.string()),
            name: JoiConstants.NAME,
        }),
    },
    getMe: {
        query: userValidation.getOne.query,
    },
};

userValidation.addQueryForMany({
    role: userRolesJoi,
    name: JoiConstants.NAME,
});

export default userValidation;
