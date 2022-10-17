import { stdout } from "process";

const logType = {
    info: "\x1b[36m" + "[INFO]" + "\x1b[0m",
    error: "\x1b[31m" + "[ERROR]" + "\x1b[0m",
    warn: "\x1b[33m \x1b[2m" + "[WARNING]" + "\x1b[0m",
    fatal: "\x1b[31m \x1b[2m" + "[FATAL]" + "\x1b[0m",
};

export default function log(
    type: keyof typeof logType,
    message: string,
    error: Error | undefined = undefined
): void {
    stdout.write(
        `${logType[type]} ${message}${
            error
                ? `\nMessage: ${error.message}\nStack:\n\t${error.stack || " "}`
                : " "
        }\n`
    );
}
