const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ success: false, msg: "Access Denied: Admin permissions required"});
    }
};
module.exports = isAdmin;