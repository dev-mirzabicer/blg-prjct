import { TokenType } from "../constants";
import httpStatus from "http-status";
import TokenModel from "../models/token.model";
import ApiError from "../utils/apiError";
import userServices from "./user.services";
import tokenServices from "./token.services";

const login = async (email: string, password: string) => {
    const user = await userServices.getOneByEmail(email);
    if (!user || !user.correctPassword(password)) {
        throw new ApiError(
            "Invalid email or password",
            httpStatus.UNAUTHORIZED
        );
    }
    return user;
};

const logout = async (refreshToken: string) => {
    const foundToken = await TokenModel.findOne({
        token: refreshToken,
        type: TokenType.REFRESH,
        inactive: false,
    });
    if (!foundToken) throw new ApiError("Not found", httpStatus.NOT_FOUND);
    await foundToken.remove();
};

const refresh = async (refreshToken: string) => {
    try {
        const foundToken = await tokenServices.verifyToken(
            refreshToken,
            TokenType.REFRESH
        );
        const user =
            typeof foundToken.user === "string"
                ? await userServices.getOne(foundToken.user)
                : await userServices.getOneByEmail(foundToken.user.email);
        if (!user) throw new Error();
        await foundToken.remove();
        return tokenServices.generateAuthTokens(user);
    } catch {
        throw new ApiError("Unauthorized", httpStatus.UNAUTHORIZED);
    }
};

const resetPassword = async (resetPasswordToken: string, password: string) => {
    try {
        const foundToken = await tokenServices.verifyToken(
            resetPasswordToken,
            TokenType.RESET_PASSWORD
        );
        const user =
            typeof foundToken.user === "string"
                ? await userServices.getOne(foundToken.user)
                : await userServices.getOneByEmail(foundToken.user.email);
        if (!user) throw new Error();
        await userServices.patch(user._id, { password });
        await TokenModel.deleteMany({
            user: user._id,
            type: TokenType.RESET_PASSWORD,
        });
    } catch {
        throw new ApiError("Couldn't reset password", httpStatus.UNAUTHORIZED);
    }
};

const verifyEmail = async (verifyEmailToken: string) => {
    try {
        const foundToken = await tokenServices.verifyToken(
            verifyEmailToken,
            TokenType.VERIFY_EMAIL
        );
        const user =
            typeof foundToken.user === "string"
                ? await userServices.getOne(foundToken.user)
                : await userServices.getOneByEmail(foundToken.user.email);
        if (!user) throw new Error();
        await userServices.patch(user._id, { verifiedEmail: true });
    } catch {
        throw new ApiError("Couldn't verify email", httpStatus.UNAUTHORIZED);
    }
};

export default {
    login,
    logout,
    refresh,
    resetPassword,
    verifyEmail,
};
