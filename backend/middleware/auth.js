const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access GrowMore' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id || decoded.userId);
      if (!admin) {
        return res.status(401).json({ 
          success: false, 
          message: 'Admin account not found' 
        });
      }
      req.user = { userId: admin._id, id: admin._id, role: 'admin', phone: admin.phone };
    } else {
      const user = await User.findById(decoded.id || decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: 'GrowMore account not found or inactive' 
        });
      }
      req.user = { userId: user._id, id: user._id, role: 'user', phone: user.phone };
    }
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, token failed' 
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin only' });
  }
};

module.exports = { protect, adminOnly };
