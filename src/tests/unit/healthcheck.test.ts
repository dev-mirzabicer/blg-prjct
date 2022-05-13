import Healthcheck from "../../models/healthcheck.model";
import { healthcheckSchema } from "../../validations";
import modelMatchesSchema from "../utils/modelMatchesSchema";

describe("Healthcheck Model", () => {
    test(
        "It should match its validation interface",
        modelMatchesSchema(Healthcheck, healthcheckSchema)
    );
});
