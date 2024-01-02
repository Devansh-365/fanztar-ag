import request from "supertest";

import app from "../index";

describe("POST /api/orders", () => {
  it("should create an order", async () => {
    const { statusCode, body } = await request(app)
      .post("/api/orders")
      .send({ components: ["I", "A", "D", "F", "K"] })
      .expect(201);

    expect(body).toMatchObject({
      id: expect.any(String),
      total: expect.any(Number),
      parts: expect.any(Array),
    });
  });
});
