const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Dog = require("../models/Dog");


const createDog = catchAsync(async(req, res, next) => {
    const dog = await Dog.create(req.body);
    res.status(201).json({ success: true, data: dog });
});


const getAllDogs = catchAsync(async(req, res, next) => {
    const dogs = await Dog.find();
    res.status(200).json({ success: true, data: dogs });
});


const getDogById = catchAsync(async(req, res, next) => {
    const dog = await Dog.findById(req.params.id);
    if (!dog) return next(new AppError("Dog not found", 404)); 
    res.status(200).json({ success: true, data: dog });
});


const updateDog = catchAsync(async(req, res, next) => {
    const dog = await Dog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dog) return next(new AppError("Dog not found", 404));
    res.status(200).json({ success: true, data: dog });
});


const deleteDog = catchAsync(async(req, res, next) => {
    const dog = await Dog.findByIdAndDelete(req.params.id);
    if (!dog) return next(new AppError("Dog not found", 404));
    res.status(200).json({ success: true, msg: "Dog deleted successfully"});
});


module.exports = {
    createDog,
    getAllDogs,
    getDogById,
    updateDog,
    deleteDog
};