import { cleanEnv, str, port } from "envalid";

const validateEnv = (): void => {
    cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ["development", "production", "test"],
        }),
        MONGO_PASSWORD: str(),
        MONGO_URI: str(),
        PORT: port({ default: 3000 }),
        API_VERSION: str(),
    });
};

export default validateEnv;
