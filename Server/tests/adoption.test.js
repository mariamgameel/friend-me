const request = require("supertest");
const app = require("../app");
const Dog = require("../models/Dog");
const AdoptionRequest = require("../models/AdoptionRequest");
const User = require("../models/User");
const { createTestAdmin, createTestUser } = require("./helpers");

describe("Adoption Workflow Endpoints", () => {
  let adminToken;
  let user1, user2;
  let dog;

  beforeAll(async () => {
    const admin = await createTestAdmin();
    adminToken = admin.token;
    user1 = await createTestUser();
    user2 = await createTestUser();

    dog = await Dog.create({
      name: `AdoptionTestDog_${Date.now()}`,
      breed: "Labrador",
      age: 2,
      gender: "Male",
      description: "Test dog for adoption workflow",
      isAdopted: false,
    });
  });

  afterAll(async () => {
    await AdoptionRequest.deleteMany({ dog: dog._id });
    await Dog.findByIdAndDelete(dog._id);
    await User.deleteMany({ email: { $regex: /^test_/ } });
  });

  it("should allow user1 to submit an adoption application", async () => {
    const res = await request(app)
      .post("/api/adoptions")
      .set("Authorization", `Bearer ${user1.token}`)
      .send({
        dog: dog._id,
        application: {
          housingType: "House",
          hasYard: true,
          phone: "555-123-4567",
          experience: "Owned dogs for 5 years",
          schedule: "Works from home",
          reason: "Seeking loving companion",
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("Pending");
    expect(res.body.data.dog._id).toBe(dog._id.toString());
  });

  it("should block user1 from submitting another request for the same dog while pending", async () => {
    const res = await request(app)
      .post("/api/adoptions")
      .set("Authorization", `Bearer ${user1.token}`)
      .send({
        dog: dog._id,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should allow user2 to also submit a request for the same dog while pending", async () => {
    const res = await request(app)
      .post("/api/adoptions")
      .set("Authorization", `Bearer ${user2.token}`)
      .send({
        dog: dog._id,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should allow user to view their own adoption requests", async () => {
    const res = await request(app)
      .get("/api/adoptions/me")
      .set("Authorization", `Bearer ${user1.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("approving user1's request should mark dog as adopted and auto-reject user2's request", async () => {
    // Find user1 request
    const req1 = await AdoptionRequest.findOne({ dog: dog._id, user: user1.user._id });

    const res = await request(app)
      .put(`/api/adoptions/${req1._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "Approved",
        adminNote: "Home check passed with flying colors",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("Approved");

    // Verify dog is now marked adopted
    const updatedDog = await Dog.findById(dog._id);
    expect(updatedDog.isAdopted).toBe(true);

    // Verify user2's request was auto-rejected
    const req2 = await AdoptionRequest.findOne({ dog: dog._id, user: user2.user._id });
    expect(req2.status).toBe("Rejected");
  });
});
