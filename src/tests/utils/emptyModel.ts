import { getModelForClass } from "@typegoose/typegoose";

class Empty {}

const EmptyModel = getModelForClass(Empty);

export default EmptyModel;
