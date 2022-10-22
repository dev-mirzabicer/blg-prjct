import { UserRole } from "../constants";
import httpStatus from "http-status";
import { authServices, tokenServices, userServices } from "../services";
import ApiError from "../utils/apiError";
import stringify from "../utils/stringify";
import catchAsync from "../utils/catchAsync";

const register = catchAsync(async (req, res, next) => {
    req.body.role = UserRole.USER;
    const user = await userServices.post(req.body);
    const tokens = await tokenServices.generateAuthTokens(user);
    res.status(httpStatus.CREATED).json({
        status: "OK",
        data: {
            user,
            tokens,
        },
    });
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await authServices.login(email, password);
    const tokens = await tokenServices.generateAuthTokens(user);
    res.status(httpStatus.OK).json({
        status: "OK",
        data: {
            user,
            tokens,
        },
    });
});

const logout = catchAsync(async (req, res, next) => {
    await authServices.logout(req.body.refreshToken);
    res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res, next) => {
    const tokens = await authServices.refresh(req.body.refreshToken);
    res.status(httpStatus.OK).json({
        status: "OK",
        data: {
            tokens,
        },
    });
});

const sendForgotPassword = catchAsync(async (req, res, next) => {
    const resetPasswordToken = await tokenServices.generateResetPasswordToken(
        req.body.email
    );
    //send email
    res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res, next) => {
    await authServices.resetPassword(
        stringify(req.query.token),
        req.body.password
    );
    res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res, next) => {
    if (!req.user)
        return next(
            new ApiError("Something went wrong", httpStatus.BAD_REQUEST)
            //⬆ This line of code will never run since this route is protected
        );
    const foundToken = await tokenServices.generateVerifyEmailToken(req.user);
    //send email
    res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res, next) => {
    await authServices.verifyEmail(stringify(req.query.token));
    res.status(httpStatus.NO_CONTENT).send();
});

export default {
    register,
    login,
    logout,
    refreshTokens,
    sendForgotPassword,
    resetPassword,
    sendVerificationEmail,
    verifyEmail,
};
