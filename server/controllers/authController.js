const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空',
        data: null
      });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        success: false,
        message: '用户名长度必须在 3-20 个字符之间',
        data: null
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码长度不能少于 6 个字符',
        data: null
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在',
        data: null
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log(`[AUTH] 用户注册成功: ${username}`);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('[AUTH] 注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试',
      data: null
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空',
        data: null
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
        data: null
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
        data: null
      });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log(`[AUTH] 用户登录成功: ${username}`);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('[AUTH] 登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试',
      data: null
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      message: '获取用户信息成功',
      data: {
        id: user._id,
        username: user.username,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('[AUTH] 获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      data: null
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};
