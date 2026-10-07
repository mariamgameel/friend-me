const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Dog = require("../models/Dog");

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

const createDog = catchAsync(async (req, res, next) => {
    const dog = await Dog.create(req.body);
    res.status(201).json({ success: true, data: dog });
});

const getAllDogs = catchAsync(async (req, res, next) => {
    const {
        q,
        gender,
        size,
        energyLevel,
        breed,
        minAge,
        maxAge,
        status,
        goodWithKids,
        sort,
        page = 1,
        limit = 12,
        all
    } = req.query;

    const query = {};

    if (q && typeof q === "string" && q.trim()) {
        const regex = new RegExp(escapeRegex(q.trim()), "i");
        query.$or = [{ name: regex }, { breed: regex }];
    }

    if (gender && ["Male", "Female"].includes(gender)) {
        query.gender = gender;
    }

    if (size && ["Small", "Medium", "Large"].includes(size)) {
        query.size = size;
    }

    if (energyLevel && ["Low", "Medium", "High"].includes(energyLevel)) {
        query.energyLevel = energyLevel;
    }

    if (breed && typeof breed === "string" && breed.trim()) {
        query.breed = new RegExp("^" + escapeRegex(breed.trim()) + "$", "i");
    }

    if (minAge !== undefined || maxAge !== undefined) {
        query.age = {};
        if (minAge !== undefined && !isNaN(Number(minAge))) query.age.$gte = Number(minAge);
        if (maxAge !== undefined && !isNaN(Number(maxAge))) query.age.$lte = Number(maxAge);
    }

    if (status === "available") {
        query.isAdopted = false;
    } else if (status === "adopted") {
        query.isAdopted = true;
    }
    // "all" or undefined: no filter on isAdopted

    if (goodWithKids === "true" || goodWithKids === true) {
        query.goodWithKids = true;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };
    else if (sort === "ageAsc") sortOptions = { age: 1 };
    else if (sort === "ageDesc") sortOptions = { age: -1 };
    else if (sort === "nameAsc") sortOptions = { name: 1 };

    const total = await Dog.countDocuments(query);

    if (all === "true") {
        const dogs = await Dog.find(query).sort(sortOptions);
        return res.status(200).json({
            success: true,
            data: dogs,
            meta: { total, page: 1, pages: 1, limit: total }
        });
    }

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (currentPage - 1) * parsedLimit;
    const pages = Math.ceil(total / parsedLimit) || 1;

    const dogs = await Dog.find(query).sort(sortOptions).skip(skip).limit(parsedLimit);

    res.status(200).json({
        success: true,
        data: dogs,
        meta: {
            total,
            page: currentPage,
            pages,
            limit: parsedLimit
        }
    });
});

const getDistinctBreeds = catchAsync(async (req, res, next) => {
    const breeds = await Dog.distinct("breed");
    const sortedBreeds = breeds.filter(Boolean).sort((a, b) => a.localeCompare(b));
    res.status(200).json({
        success: true,
        data: sortedBreeds
    });
});

const getDogById = catchAsync(async (req, res, next) => {
    const dog = await Dog.findById(req.params.id);
    if (!dog) return next(new AppError("Dog not found", 404)); 
    res.status(200).json({ success: true, data: dog });
});

const updateDog = catchAsync(async (req, res, next) => {
    const dog = await Dog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dog) return next(new AppError("Dog not found", 404));
    res.status(200).json({ success: true, data: dog });
});

const deleteDog = catchAsync(async (req, res, next) => {
    const dog = await Dog.findByIdAndDelete(req.params.id);
    if (!dog) return next(new AppError("Dog not found", 404));
    res.status(200).json({ success: true, message: "Dog deleted successfully" });
});

module.exports = {
    createDog,
    getAllDogs,
    getDistinctBreeds,
    getDogById,
    updateDog,
    deleteDog
};