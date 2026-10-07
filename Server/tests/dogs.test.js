const request = require("supertest");
const app = require("../app");
const Dog = require("../models/Dog");
const User = require("../models/User");
const { createTestAdmin, createTestUser } = require("./helpers");

describe("Dogs Endpoints", () => {
  let adminToken;
  let userToken;
  let testDogId;

  beforeAll(async () => {
    const admin = await createTestAdmin();
    adminToken = admin.token;
    const user = await createTestUser();
    userToken = user.token;
  });

  afterAll(async () => {
    await Dog.deleteMany({ name: { $regex: /^TestDog_/ } });
    await User.deleteMany({ email: { $regex: /^test_/ } });
  });

  describe("GET /api/dogs", () => {
    it("should return a list of dogs with success: true and meta pagination", async () => {
      const res = await request(app).get("/api/dogs");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
    });

    it("should support filtering by status", async () => {
      const res = await request(app).get("/api/dogs?status=available");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((dog) => {
        expect(dog.isAdopted).toBe(false);
      });
    });
  });

  describe("Admin CRUD & Access Control", () => {
    it("should block non-admin from creating a dog (403)", async () => {
      const res = await request(app)
        .post("/api/dogs")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "TestDog_Blocked",
          breed: "Beagle",
          age: 2,
          gender: "Male",
          description: "Friendly dog",
        });

      expect([401, 403]).toContain(res.status);
    });

    it("should allow admin to create a new dog", async () => {
      const res = await request(app)
        .post("/api/dogs")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: `TestDog_${Date.now()}`,
          breed: "Husky",
          age: 3,
          gender: "Female",
          size: "Large",
          energyLevel: "High",
          description: "Loving husky looking for active home",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBeDefined();
      testDogId = res.body.data._id;
    });

    it("should retrieve dog details by ID", async () => {
      const res = await request(app).get(`/api/dogs/${testDogId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(testDogId);
    });

    it("should return 404 for a non-existent dog ID", async () => {
      const fakeId = "60c72b2f9b1d8b2bad999999";
      const res = await request(app).get(`/api/dogs/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should allow admin to update a dog", async () => {
      const res = await request(app)
        .put(`/api/dogs/${testDogId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          healthStatus: "Special Needs",
          vaccinated: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.healthStatus).toBe("Special Needs");
    });

    it("should allow admin to delete a dog", async () => {
      const res = await request(app)
        .delete(`/api/dogs/${testDogId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await Dog.findById(testDogId);
      expect(check).toBeNull();
    });
  });
});
