const request = require("supertest");
const app = require("../app");

describe("Common Middleware & Standard Error Shapes", () => {
  it("should return standard 404 JSON response for unknown routes", async () => {
    const res = await request(app).get("/api/unknown-nonexistent-endpoint");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });
});
