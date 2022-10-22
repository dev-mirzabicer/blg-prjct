import { UserRole } from "../constants";
import httpStatus from "http-status";
import { authorServices } from "../services";
import ApiError from "../utils/apiError";
import catchAsync from "../utils/catchAsync";

const patch = catchAsync(async (req, res, next) => {
    const author = await authorServices.patch(req.params.id, req.body);
    res.status(httpStatus.OK).json({
        status: "OK",
        data: { author },
    });
});

const patchMe = catchAsync(async (req, res, next) => {
    if (!req.user || req.user.role != UserRole.AUTHOR)
        return next(
            new ApiError(
                "You must be a logged in author to perform this action",
                httpStatus.UNAUTHORIZED
            )
        );
    const author = await authorServices.getOneByUser(req.user._id);
    if (!author) {
        return next(
            new ApiError("You're not an author", httpStatus.UNAUTHORIZED)
        );
    }
    // Object.assign(author, req.body);
    // author.save();
    await author.update(req.body, { runValidators: true });
    Object.assign(author, req.body);
    res.status(httpStatus.OK).json({
        status: "OK",
        data: { author },
    });
});

const getMe = catchAsync(async (req, res, next) => {
    if (!req.user || req.user.role != UserRole.AUTHOR)
        return next(
            new ApiError(
                "You must be a logged in author to perform this action",
                httpStatus.UNAUTHORIZED
            )
        );
    const author = await authorServices.getOneByUser(req.user.id);
    res.status(httpStatus.OK).json({
        status: "OK",
        data: { author },
    });
});

export default {
    patch,
    patchMe,
    getMe,
};
