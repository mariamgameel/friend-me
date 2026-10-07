require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const products = [
    {
        name: "Premium Dry Dog Food (5kg)",
        price: 24.99,
        category: "Food",
        featured: true,
        description: "Balanced nutrition with real chicken and wholesome brown rice as primary ingredients.",
        stock: 40,
        image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80"
    },
    {
        name: "Interactive Puzzle Feeder",
        price: 14.50,
        category: "Toys",
        featured: true,
        description: "Slows down fast eaters and provides rewarding mental stimulation.",
        stock: 25,
        image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&auto=format&fit=crop&q=80"
    },
    {
        name: "Durable Chew Toy Rope",
        price: 8.99,
        category: "Toys",
        featured: false,
        description: "Natural cotton rope toy for tug-of-war, chewing, and teeth cleaning.",
        stock: 60,
        image: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=600&auto=format&fit=crop&q=80"
    },
    {
        name: "Orthopedic Memory Foam Dog Bed",
        price: 39.99,
        category: "Beds",
        featured: true,
        description: "Memory foam bed for soothing joint support with washable plush cover.",
        stock: 4, // low stock test
        image: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=600&auto=format&fit=crop&q=80"
    },
    {
        name: "Adjustable Reflective Collar",
        price: 9.99,
        category: "Walking",
        featured: false,
        description: "Heavy-duty nylon with reflective stitching for twilight walking safety.",
        stock: 50,
        image: "https://images.unsplash.com/photo-1597843797221-cfbe982b6b55?w=600&auto=format&fit=crop&q=80"
    },
    {
        name: "Retractable Leash 5m",
        price: 17.50,
        category: "Walking",
        featured: false,
        description: "Smooth tangle-free retraction with one-touch brake and ergonomic soft-touch grip.",
        stock: 3, // low stock test
        image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop&q=80"
    },
    {
        name: "Oatmeal Soothing Shampoo",
        price: 11.99,
        category: "Grooming",
        featured: false,
        description: "Hypoallergenic soap-free formula enriched with aloe vera to calm itchy skin.",
        stock: 35,
        image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80"
    },
    {
        name: "Grain-Free Training Treats (200g)",
        price: 6.99,
        category: "Food",
        featured: true,
        description: "Low-calorie savory bite-sized treats perfect for trick learning and positive reinforcement.",
        stock: 80,
        image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600&auto=format&fit=crop&q=80"
    },
    {
        name: "Ventilated Travel Carrier Backpack",
        price: 45.00,
        category: "Travel",
        featured: false,
        description: "Breathable airline-friendly backpack with padded shoulder straps and safety tether.",
        stock: 2, // low stock test
        image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80"
    },
    {
        name: "Self-Cleaning Slicker Grooming Brush",
        price: 12.99,
        category: "Grooming",
        featured: false,
        description: "Fine wire bristles gently de-shed loose fur with instant one-click push-button cleaning.",
        stock: 28,
        image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&auto=format&fit=crop&q=80"
    }
];

async function seed() {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/friend_me";
    try {
        await mongoose.connect(mongoUri);
        await Product.deleteMany({});
        await Product.insertMany(products);
        console.log(`Seeded ${products.length} categorized products`);
    } catch (error) {
        console.error("Seeding failed: ", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seed();