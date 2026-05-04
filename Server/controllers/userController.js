const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    registerSchema,
    loginSchema
} = require ("../validators/userValidator");

const registerUser = async (req, res) => {
    try{
        const { error } = registerSchema.validate(req.body, { abortEarly: false });
        if (error) return res.status(400).json({ msg: error.details.map(d => d.message) });
        const { username, email, password, role } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role
        });
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(201).json(userResponse);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try{
        const users = await User.find().select("-password");
        res.status(200).json({users});
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body, { abortEarly: false });
        if (error) return res.status(400).json({ msg: error.details.map(d => d.message) });
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = { 
    registerUser,
    getAllUsers,
    loginUser };







//     const getAllUsers = async (req, res) => {
//     try{
//         const users = await User.find().select("-password");
//         res.status(200).json({users});
//     } catch (error) {
//         res.status(500).json({ msg: error.message });
//     }
// };

const getAllUsers = async (req, res) =>{
    try {
        const users = await User.find().select("-password");
        res.status(200).json({users});
    } catch(error){
        res.status(500).json({msg: error.message});
    }
};

const getAllUsers = async(req, res) => {
    try{
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
};