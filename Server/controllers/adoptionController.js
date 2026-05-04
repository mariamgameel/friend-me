const AdoptionRequest = require("../models/AdoptionRequest");
const Dog = require("../models/Dog");
const {
    createRequestSchema,
    updateStatusSchema
} = require("../validators/adoptionValidator");

const createAdoptionRequest = async (req, res) => {
    try{
        const { error } = createRequestSchema.validate(req.body, { abortEarly: false });
        if (error) return res.status(400).json({ msg: error.details.map(d => d.message) });
        const dog = await Dog.findById(req.body.dog);
        if (!dog) return res.status(404).json({ msg: "Dog not found" });
        if (dog.isAdopted) return res.status(400).json({ msg: "Dog's already adopted" });

        const existingRequest = await AdoptionRequest.findOne({
            user: req.user.id,
            dog: req.body.dog
        });
        if (existingRequest) {
            return res.status(400).json({ msg: "You have already requested to adopt this dog"});
        }
        const request = await AdoptionRequest.create ({
            user: req.user.id,
            dog: req.body.dog
        });
        res.status(201).json( request );
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getAllRequests = async(req, res) => {
    try {
        const requests = await AdoptionRequest
        .find()
        .populate("user")
        .populate("dog");
        res.json(requests);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const updateRequestStatus = async(req, res) => {
    try {
        const { error } = updateStatusSchema.validate(req.body, { abortEarly: false });
        if (error) return res.status(400).json({ msg: error.details.map(d => d.message) });
        const request = await AdoptionRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ msg: "Request not found" });
        }
        request.status = req.body.status;
        await request.save();
        if (req.body.status === "Approved") {
            await Dog.findByIdAndUpdate(request.dog, {
                isAdopted: true
            });
        }
        res.json(request);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    createAdoptionRequest,
    getAllRequests,
    updateRequestStatus
};