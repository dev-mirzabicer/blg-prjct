import httpStatus from "http-status";
import UserModel from "../models/user.model";
import catchAsync from "../utils/catchAsync";

const keepUserFresh = catchAsync(async (req, res, next) => {
    if (req.user) {
        req.user = (await UserModel.findById(req.user._id)) || undefined;
    }
    next();
});
