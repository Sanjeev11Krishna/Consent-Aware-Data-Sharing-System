const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization')?.replace('Bearer', '')
        if (!token){
            return res.status(401).json({ message: 'Unauthorized token' })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId).select('-password')
        if (!user){
            return res.status(401).json({message: 'Unauthorized token'})
        }
        req.user = user
        req.userId = user._id
        next()
    } catch (error) {
        return res.status(401).json({message: 'Authentication failed'})
    }
};

module.exports = auth