import request from "supertest";
import { app as App, server } from "../../";

let TEMP_ID: string | undefined;
const URL = `/api/v${process.env.API_VERSION}/healthcheck`;
const NON_EXSTNG_ID = "627e04117a769509476feb1f";
const INVALID_ID = "123xyz";

const app = App.express;

describe("API Methods", () => {
    test("POST /healthcheck/", () => {
        return request(app)
            .post(`${URL}/`)
            .send({
                healthcheck: "Test",
            })
            .then((response) => {
                expect(response.status).toEqual(201);
                expect(response.body.status).toEqual("OK");
                expect(response.body.data.healthcheck).toHaveProperty("_id");
                expect(response.body.data.healthcheck).toHaveProperty(
                    "healthcheck"
                );
                TEMP_ID = response.body.data.healthcheck._id;
            })
            .catch((error) => {
                expect(error).toBeUndefined();
            });
    });
    test("GET /healthcheck/", () => {
        return request(app)
            .get(`${URL}/`)
            .then((response) => {
                expect(response.status).toEqual(200);
                expect(response.body.status).toEqual("OK");
                expect(response.body.data.healthchecks).toContainEqual({
                    _id: TEMP_ID,
                    healthcheck: "Test",
                    // __v: 0,
                });
            })
            .catch((error) => {
                expect(error).toBeUndefined();
            });
    });
    test("GET /healthcheck/:id", () => {
        return request(app)
            .get(`${URL}/${TEMP_ID || INVALID_ID}`)
            .then((response) => {
                expect(response.body).toMatchObject({
                    status: "OK",
                    data: {
                        healthcheck: {
                            healthcheck: "Test",
                            _id: TEMP_ID,
                        },
                    },
                });
            })
            .catch((error) => {
                expect(error).toBeUndefined();
            });
    });
    test("GET /healthcheck:id - Invalid ID", () => {
        return request(app)
            .get(`${URL}/${INVALID_ID}`)
            .then((wrongResponse) => {
                expect(wrongResponse.status).toEqual(400);
                expect(wrongResponse.body.status).toEqual("fail");
            })
            .catch((error) => {
                expect(error).toBeUndefined();
            });
    });
    test("GET /healthcheck:id - Not-existing ID", () => {
        return request(app)
            .get(`${URL}/${NON_EXSTNG_ID}`)
            .then((wrongResponse) => {
                expect(wrongResponse.status).toEqual(404);
                expect(wrongResponse).toHaveProperty("error");
                expect(wrongResponse.body.status).toEqual("fail");
            })
            .catch((error) => {
                expect(error).toBeUndefined();
            });
    });
    test("PATCH /healthcheck/:id", () => {
        return request(app)
            .patch(`${URL}/${TEMP_ID || INVALID_ID}`)
            .send({
                healthcheck: "Test2",
            })
            .then((response) => {
                expect(response.status).toEqual(200);
                expect(response.body).toEqual({
                    status: "OK",
                    data: {
                        healthcheck: {
                            _id: TEMP_ID,
                            healthcheck: "Test2",
                            __v: 0,
                        },
                    },
                });
            })
            .catch((error) => {
                expect(error).toBeUndefined();
            });
    });
    test("DELETE /healthcheck/:id", () => {
        return request(app)
            .delete(`${URL}/${TEMP_ID || INVALID_ID}`)
            .then((response) => {
                expect(response.status).toEqual(204);
                expect(response.body).toEqual({});
                TEMP_ID = undefined;
            })
            .catch((error) => {
                expect(error).toBeUndefined();
            });
    });
    afterAll(() => {
        App.quit();
        server.close();
    });
});
