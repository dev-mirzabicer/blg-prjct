import { getModelForClass, prop } from "@typegoose/typegoose";

class Healthcheck {
    @prop({ required: true })
    public healthcheck!: string;
}

const HealthcheckModel = getModelForClass(Healthcheck);

export default HealthcheckModel;
