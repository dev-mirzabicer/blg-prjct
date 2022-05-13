import request from "supertest";
import { app as App, server } from "../../";

let TEMP_ID: string | undefined;

const app = App.express;

describe("API Methods", () => {
    test("POST /healthcheck/", async () => {
        return request(app)
            .post("/api/v0.0.1/healthcheck/")
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
    test("GET /healthcheck/", async () => {
        return request(app)
            .get("/api/v0.0.1/healthcheck/")
            .then((response) => {
                expect(response.status).toEqual(200);
                expect(response.body.status).toEqual("OK");
                expect(response.body.data.healthchecks).toContainEqual({
                    _id: TEMP_ID,
                    healthcheck: "Test",
                    __v: 0,
                });
            })
            .catch((error) => {
                expect(error).toBeUndefined();
            });
    });
    test("GET /healthcheck/:id", async () => {
        return request(app)
            .get(`/api/v0.0.1/healthcheck/${TEMP_ID}`)
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
    test("GET /healthcheck:id - Invalid ID", async () => {
        return request(app)
            .get("/api/v0.0.1/healthcheck/123")
            .then((wrongResponse) => {
                expect(wrongResponse.status).toEqual(400);
                expect(wrongResponse.body.status).toEqual("fail");
            })
            .catch((error) => {
                expect(error).toBeUndefined();
            });
    });
    test("GET /healthcheck:id - Not-existing ID", async () => {
        return request(app)
            .get("/api/v0.0.1/healthcheck/627e04117a769509476feb1f")
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
            .patch(`/api/v0.0.1/healthcheck/${TEMP_ID}`)
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
    test("DELETE /healthcheck/:id", async () => {
        return request(app)
            .delete(`/api/v0.0.1/healthcheck/${TEMP_ID}`)
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
