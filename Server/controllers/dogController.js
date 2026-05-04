const Dog = require("../models/Dog");
const {
    createDogSchema,
    updateDogSchema
} = require ("../validators/dogValidator");

const createDog = async(req, res) => {
    try {
        const { error } = createDogSchema.validate(req.body, { abortEarly: false });
        if (error) return res.status(400).json({ msg: error.details.map(d => d.message) });
        const dog = await Dog.create(req.body);
        res.status(201).json(dog);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

const getAllDogs = async(req, res) => {
    try {
        const dogs = await Dog.find();
        res.status(200).json(dogs);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getDogById = async(req, res) => {
    try {
        const dog = await Dog.findById(req.params.id);
        if (!dog) {
            return res.status(404).json({ msg: "Dog not found" });
        }
        res.status(200).json(dog);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

const updateDog = async(req, res) => {
    try {
         const { error } = updateDogSchema.validate(req.body, { abortEarly: false });
         if (error) return res.status(400).json({ msg: error.details.map(d => d.message) });
        const dog = await Dog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!dog) {
            return res.status(404).json({ msg: "Dog not found" });
        }
        res.status(200).json(dog);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

const deleteDog = async(req, res) => {
    try {
        const dog = await Dog.findByIdAndDelete(req.params.id);
        if (!dog) {
            return res.status(404).json({ msg: "Dog not found" });
        }
        res.status(200).json({ msg: "Dog deleted successfully"});
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

module.exports = {
    createDog,
    getAllDogs,
    getDogById,
    updateDog,
    deleteDog
};