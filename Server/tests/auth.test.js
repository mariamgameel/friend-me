const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

describe("Auth Endpoints", () => {
  const testEmail = `test_auth_${Date.now()}@friend.me`;
  const testPassword = "Password123";

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /^test_auth_/ } });
  });

  describe("POST /api/users/register", () => {
    it("should successfully register a new user with role 'user'", async () => {
      const res = await request(app)
        .post("/api/users/register")
        .send({
          username: "testuser",
          email: testEmail,
          password: testPassword,
          role: "admin", // B1: attempt to escalate role should be ignored
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testEmail);
      expect(res.body.data.role).toBe("user");
      expect(res.body.data.password).toBeUndefined();
    });

    it("should reject registration with a weak password (no number or <8 chars)", async () => {
      const res = await request(app)
        .post("/api/users/register")
        .send({
          username: "weakuser",
          email: `weak_${Date.now()}@friend.me`,
          password: "short",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBeDefined();
    });

    it("should reject registration with duplicate email", async () => {
      const res = await request(app)
        .post("/api/users/register")
        .send({
          username: "dupeuser",
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/users/login", () => {
    it("should successfully log in with correct credentials and return JWT token", async () => {
      const res = await request(app)
        .post("/api/users/login")
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testEmail);
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app)
        .post("/api/users/login")
        .send({
          email: testEmail,
          password: "WrongPassword999",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid Credentials/i);
    });

    it("should reject login with non-existent email", async () => {
      const res = await request(app)
        .post("/api/users/login")
        .send({
          email: "nonexistent_404@friend.me",
          password: testPassword,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid Credentials/i);
    });
  });
});
