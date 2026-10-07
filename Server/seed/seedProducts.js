require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const products = [
    { name: "Premium Dry Dog Food (5kg)", price: 24.99, description: "Balanced nutrition with real chicken as the first ingredient.", stock: 40 },
    { name: "Interactive Puzzle Feeder", price: 14.5, description: "Slows down fast eaters and provides mental stimulation.", stock: 25 },
    { name: "Durable Chew Toy Rope", price: 8.99, description: "Cotton rope toy for tug-of-war and teeth cleaning.", stock: 60 },
    { name: "Orthopedic Dog Bed (Large)", price: 39.99, description: "Memory foam bed for joint support, machine-washable cover.", stock: 15 },
    { name: "Adjustable Nylon Collar", price: 9.99, description: "Reflective stitching for visibility on evening walks.", stock: 50 },
    { name: "Retractable Leash 5m", price: 17.5, description: "One-button lock, comfortable non-slip grip.", stock: 30 },
    { name: "Oatmeal Shampoo for Sensitive Skin", price: 11.99, description: "Soap-free formula, soothes itching and dry skin.", stock: 35 },
    { name: "Grain-Free Training Treats", price: 6.99, description: "Small bite-sized treats, ideal for positive reinforcement.", stock: 80 },
    { name: "Travel Carrier Backpack", price: 45.0, description: "Ventilated backpack carrier for small dogs, airline-approved size.", stock: 10 },
    { name: "Self-Cleaning Slicker Brush", price: 12.99, description: "Retractable pins remove loose fur with one button.", stock: 28 }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Product.deleteMany({});
        await Product.insertMany(products);
        console.log(`Seeded ${products.length} products`);
    } catch (error) {
        console.error("Seeding failed: ", error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();