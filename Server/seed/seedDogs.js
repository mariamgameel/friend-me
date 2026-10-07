require("dotenv").config();
const mongoose = require("mongoose");
const Dog = require("../models/Dog");

const sampleDogs = [
    {
        name: "Max",
        age: 2,
        breed: "Golden Retriever",
        gender: "Male",
        size: "Large",
        energyLevel: "High",
        vaccinated: true,
        neutered: true,
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: true,
        personalityTags: ["Playful", "Loyal", "Gentle", "Affectionate"],
        description: "Max is an energetic golden boy who lives for tennis balls, trail walks, and evening belly rubs. He loves children and is great around other pets.",
        healthStatus: "Fully Vaccinated & Microchipped",
        isAdopted: false,
        shelterLocation: "Downtown Sanctuary",
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=80",
        images: [
            "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&q=80"
        ]
    },
    {
        name: "Bella",
        age: 3,
        breed: "Labrador Retriever",
        gender: "Female",
        size: "Large",
        energyLevel: "Medium",
        vaccinated: true,
        neutered: true,
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: false,
        personalityTags: ["Cuddle Bug", "Calm", "Friendly", "Curious"],
        description: "Bella is a gentle soul who enjoys lazy afternoon sunbaths and easy neighborhood strolls. She's leash trained and knows all basic commands.",
        healthStatus: "Healthy & Vaccinated",
        isAdopted: false,
        shelterLocation: "Westside Haven",
        image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80",
        images: [
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80"
        ]
    },
    {
        name: "Charlie",
        age: 1,
        breed: "French Bulldog",
        gender: "Male",
        size: "Small",
        energyLevel: "Medium",
        vaccinated: true,
        neutered: true,
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: true,
        personalityTags: ["Charming", "Quiet", "Loving", "Silly"],
        description: "Charlie is a compact bundle of charisma with adorable bat ears and a huge heart. Perfect apartment companion who rarely barks.",
        healthStatus: "Up to date on shots",
        isAdopted: false,
        shelterLocation: "North Hills Shelter",
        image: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=800&auto=format&fit=crop&q=80",
        images: [
            "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=800&auto=format&fit=crop&q=80"
        ]
    },
    {
        name: "Luna",
        age: 4,
        breed: "Siberian Husky",
        gender: "Female",
        size: "Large",
        energyLevel: "High",
        vaccinated: true,
        neutered: true,
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: false,
        personalityTags: ["Vocal", "Athletic", "Adventurous", "Smart"],
        description: "Luna is a stunning blue-eyed husky who thrives on hikes and cold weather outdoor runs. She sings hello and bonds deeply with active owners.",
        healthStatus: "Healthy & Spayed",
        isAdopted: false,
        shelterLocation: "Highland Rescue",
        image: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800&auto=format&fit=crop&q=80",
        images: [
            "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800&auto=format&fit=crop&q=80"
        ]
    },
    {
        name: "Milo",
        age: 2,
        breed: "Beagle",
        gender: "Male",
        size: "Medium",
        energyLevel: "High",
        vaccinated: true,
        neutered: true,
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: true,
        personalityTags: ["Curious", "Sweet", "Playful", "Friendly"],
        description: "Milo has the softest ears and an unstoppable nose. He loves sniffing gardens, discovering hidden dog treats, and curling up at your feet.",
        healthStatus: "Vaccinated & Dewormed",
        isAdopted: false,
        shelterLocation: "Downtown Sanctuary",
        image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800&auto=format&fit=crop&q=80",
        images: [
            "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800&auto=format&fit=crop&q=80"
        ]
    },
    {
        name: "Daisy",
        age: 5,
        breed: "Cavalier King Charles",
        gender: "Female",
        size: "Small",
        energyLevel: "Low",
        vaccinated: true,
        neutered: true,
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: true,
        personalityTags: ["Gentle", "Cuddly", "Quiet", "Polite"],
        description: "Daisy is the quintessential lapdog. Polite, graceful, and always ready to sit on the couch while you read or work remotely.",
        healthStatus: "Dental clean & Vaccinated",
        isAdopted: false,
        shelterLocation: "Westside Haven",
        image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&auto=format&fit=crop&q=80",
        images: [
            "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&auto=format&fit=crop&q=80"
        ]
    },
    {
        name: "Rocky",
        age: 3,
        breed: "German Shepherd",
        gender: "Male",
        size: "Large",
        energyLevel: "High",
        vaccinated: true,
        neutered: true,
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: false,
        personalityTags: ["Protective", "Obedient", "Intelligent", "Brave"],
        description: "Rocky is sharp as a tack and eager to please. He excels at agility and puzzle toys and forms an unbreakable bond with his handler.",
        healthStatus: "Excellent condition",
        isAdopted: false,
        shelterLocation: "North Hills Shelter",
        image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&auto=format&fit=crop&q=80",
        images: [
            "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&auto=format&fit=crop&q=80"
        ]
    },
    {
        name: "Rosie",
        age: 1,
        breed: "Corgi",
        gender: "Female",
        size: "Small",
        energyLevel: "High",
        vaccinated: true,
        neutered: true,
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: true,
        personalityTags: ["Spunky", "Joyful", "Talkative", "Alert"],
        description: "Rosie is full of cheerful hops and cheerful wagging tails. Her short legs don't stop her from sprinting across the dog park with gusto.",
        healthStatus: "Fully Vaccinated",
        isAdopted: false,
        shelterLocation: "Downtown Sanctuary",
        image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&auto=format&fit=crop&q=80",
        images: [
            "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&auto=format&fit=crop&q=80"
        ]
    },
    {
        name: "Cooper",
        age: 6,
        breed: "Australian Shepherd",
        gender: "Male",
        size: "Medium",
        energyLevel: "Medium",
        vaccinated: true,
        neutered: true,
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: true,
        personalityTags: ["Attentive", "Loyal", "Wise", "Agile"],
        description: "Cooper has gorgeous merle markings and a serene, steady temperament. He is calm indoors and always ready for weekend outdoor escapades.",
        healthStatus: "Senior check completed & Vaccinated",
        isAdopted: false,
        shelterLocation: "Highland Rescue",
        image: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=800&auto=format&fit=crop&q=80",
        images: [
            "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=800&auto=format&fit=crop&q=80"
        ]
    },
    {
        name: "Oliver",
        age: 2,
        breed: "Poodle",
        gender: "Male",
        size: "Medium",
        energyLevel: "Medium",
        vaccinated: true,
        neutered: true,
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: true,
        personalityTags: ["Hypoallergenic", "Clever", "Sweet", "Graceful"],
        description: "Oliver has a soft curly coat that doesn't shed, making him ideal for allergy sufferers. He learns new tricks in minutes and loves agility.",
        healthStatus: "Vaccinated & Groomed",
        isAdopted: false,
        shelterLocation: "Westside Haven",
        image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=80",
        images: [
            "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=80"
        ]
    },
    {
        name: "Stella",
        age: 4,
        breed: "Border Collie",
        gender: "Female",
        size: "Medium",
        energyLevel: "High",
        vaccinated: true,
        neutered: true,
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: false,
        personalityTags: ["Genius", "Focus", "Fast", "Playful"],
        description: "Stella was successfully adopted by a warm family with a big backyard, and she is thriving! Her success story inspires all of our rescue efforts.",
        healthStatus: "Spayed & Healthy",
        isAdopted: true,
        adoptedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        shelterLocation: "Downtown Sanctuary",
        image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800&auto=format&fit=crop&q=80",
        images: [
            "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800&auto=format&fit=crop&q=80"
        ]
    },
    {
        name: "Barnaby",
        age: 7,
        breed: "Basset Hound",
        gender: "Male",
        size: "Medium",
        energyLevel: "Low",
        vaccinated: true,
        neutered: true,
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: true,
        personalityTags: ["Gentle Giant", "Mellow", "Loving", "Snoozer"],
        description: "Barnaby found his forever couch last month! He loves afternoon naps and getting ear scratches while watching television with his new dad.",
        healthStatus: "Healthy Senior",
        isAdopted: true,
        adoptedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        shelterLocation: "Highland Rescue",
        image: "https://images.unsplash.com/photo-1544568100-847a948585b9?w=800&auto=format&fit=crop&q=80",
        images: [
            "https://images.unsplash.com/photo-1544568100-847a948585b9?w=800&auto=format&fit=crop&q=80"
        ]
    }
];

async function seedDogs() {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/friend_me";
    try {
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB for dogs seed...");
        await Dog.deleteMany({});
        await Dog.insertMany(sampleDogs);
        console.log(`Seeded ${sampleDogs.length} sample dogs successfully!`);
    } catch (error) {
        console.error("Failed to seed dogs:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedDogs();
