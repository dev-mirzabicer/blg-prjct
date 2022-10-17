import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "./user.model";
import { TokenType } from "../constants";

class Token {
    @prop({ required: true, index: true })
    public token!: string;

    @prop({ required: true, ref: () => User, type: () => String })
    public user!: Ref<User, string>;

    @prop({ required: true, enum: TokenType })
    public type!: TokenType;

    @prop({ required: true, type: Date })
    public expires!: Date;

    @prop({ default: false })
    public inactive?: boolean;
}

const TokenModel = getModelForClass(Token);

export default TokenModel;
