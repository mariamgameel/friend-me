const request = require("supertest");
const app = require("../app");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const { createTestAdmin, createTestUser } = require("./helpers");

describe("Orders & Inventory Endpoints", () => {
  let adminToken;
  let user;
  let product;

  beforeAll(async () => {
    const admin = await createTestAdmin();
    adminToken = admin.token;
    user = await createTestUser();

    product = await Product.create({
      name: `OrderTestProduct_${Date.now()}`,
      category: "Food",
      price: 19.99,
      stock: 5,
      description: "Test kibble for inventory decrement tests",
    });
  });

  afterAll(async () => {
    await Order.deleteMany({ "items.product": product._id });
    await Product.findByIdAndDelete(product._id);
    await User.deleteMany({ email: { $regex: /^test_/ } });
  });

  it("should create an order and atomically decrement product stock", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        items: [{ product: product._id, quantity: 2 }],
        shippingAddress: {
          fullName: "Test Customer",
          phone: "555-987-6543",
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("Pending");
    expect(res.body.data.total).toBeCloseTo(19.99 * 2 + 10, 2);

    // Verify stock in database decreased from 5 to 3
    const updatedProd = await Product.findById(product._id);
    expect(updatedProd.stock).toBe(3);
  });

  it("should reject an order if requested quantity exceeds available stock", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        items: [{ product: product._id, quantity: 10 }], // only 3 left
        shippingAddress: {
          fullName: "Test Customer",
          phone: "555-987-6543",
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);

    // Verify stock remains untouched at 3
    const checkProd = await Product.findById(product._id);
    expect(checkProd.stock).toBe(3);
  });

  it("should allow customer to view their orders", async () => {
    const res = await request(app)
      .get("/api/orders/me")
      .set("Authorization", `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
