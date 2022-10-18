import httpStatus from "http-status";
import { userServices } from "../services";
import ApiError from "../utils/apiError";
import catchAsync from "../utils/catchAsync";

const changeRole = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { role } = req.body;
    const user = await userServices.patch(id, { role });
    if (!user)
        return next(new ApiError("User not found", httpStatus.NOT_FOUND));
    res.status(httpStatus.OK).json({
        status: "OK",
        data: { user },
    });
});

const deleteOne = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user = await userServices.deleteOne(id);
    if (!user)
        return next(new ApiError("User not found", httpStatus.NOT_FOUND));
    res.status(httpStatus.NO_CONTENT).send();
});

const getOne = catchAsync(async (req, res, next) => {
    const user = await userServices.getOne(req.params.id);
    if (!user)
        return next(new ApiError("User not found", httpStatus.NOT_FOUND));
    res.status(httpStatus.OK).json({
        status: "OK",
        data: { user },
    });
});

const getMany = catchAsync(async (req, res, next) => {
    const users = await userServices.getMany(req.query);
    res.status(httpStatus.OK).json({
        status: "OK",
        data: { users },
    });
});

const getMe = catchAsync(async (req, res, next) => {
    res.status(httpStatus.OK).json({
        status: "OK",
        data: { user: req.user },
    });
});

const patchMe = catchAsync(async (req, res, next) => {
    //not editing the req.body or cleaning it up since it'll already be done by the validators
    const user = await userServices.patch(req.user?._id, req.body);
    req.user = user || undefined;
    res.status(httpStatus.OK).json({
        status: "OK",
        data: { user: user },
    });
});

const deleteMe = catchAsync(async (req, res, next) => {
    const user = userServices.deleteOne(req.user?._id);
    res.status(httpStatus.NO_CONTENT).send();
});

export default {
    changeRole,
    deleteOne,
    getOne,
    getMany,
    getMe,
    patchMe,
    deleteMe,
};
