const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const redisClient = require('../config/redis');
const { logRegister, logLogin, logLogout, logAction } = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const CAPTCHA_EXPIRE_SECONDS = 120;

const generateCaptchaId = () => {
  return crypto.randomBytes(16).toString('hex');
};

const generateSliderCaptcha = async (req, res) => {
  try {
    const captchaId = generateCaptchaId();
    
    const targetPosition = Math.floor(Math.random() * 180) + 40;
    
    const tolerance = 5;
    
    const captchaData = {
      targetPosition,
      tolerance,
      createdAt: Date.now(),
      validated: false
    };

    const redis = redisClient.getClient();
    if (redis) {
      await redis.setex(
        `captcha:slider:${captchaId}`,
        CAPTCHA_EXPIRE_SECONDS,
        JSON.stringify(captchaData)
      );
    }

    res.json({
      success: true,
      message: '验证码生成成功',
      data: {
        captchaId,
        targetPosition,
        tolerance
      }
    });

  } catch (error) {
    console.error('[CAPTCHA] 生成滑动验证码错误:', error);
    res.status(500).json({
      success: false,
      message: '生成验证码失败',
      data: null
    });
  }
};

const verifySliderCaptcha = async (req, res) => {
  try {
    const { captchaId, userPosition } = req.body;

    if (!captchaId || userPosition === undefined || userPosition === null) {
      return res.status(400).json({
        success: false,
        message: '验证码参数不完整',
        data: null
      });
    }

    const redis = redisClient.getClient();
    let captchaData = null;

    if (redis) {
      const cachedData = await redis.get(`captcha:slider:${captchaId}`);
      if (cachedData) {
        captchaData = JSON.parse(cachedData);
      }
    }

    if (!captchaData) {
      return res.status(400).json({
        success: false,
        message: '验证码已过期或不存在',
        data: null
      });
    }

    if (captchaData.validated) {
      return res.status(400).json({
        success: false,
        message: '验证码已被使用',
        data: null
      });
    }

    const { targetPosition, tolerance } = captchaData;
    const positionDiff = Math.abs(userPosition - targetPosition);
    const isVerified = positionDiff <= tolerance;

    if (isVerified) {
      captchaData.validated = true;
      if (redis) {
        await redis.setex(
          `captcha:slider:${captchaId}`,
          CAPTCHA_EXPIRE_SECONDS,
          JSON.stringify(captchaData)
        );
      }

      res.json({
        success: true,
        message: '验证码验证通过',
        data: {
          isVerified: true,
          captchaId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: '验证失败，请重试',
        data: {
          isVerified: false,
          positionDiff
        }
      });
    }

  } catch (error) {
    console.error('[CAPTCHA] 验证滑动验证码错误:', error);
    res.status(500).json({
      success: false,
      message: '验证失败，请稍后重试',
      data: null
    });
  }
};

const validateCaptcha = async (captchaId) => {
  if (!captchaId) return false;

  const redis = redisClient.getClient();
  if (!redis) return true;

  try {
    const cachedData = await redis.get(`captcha:slider:${captchaId}`);
    if (!cachedData) return false;

    const captchaData = JSON.parse(cachedData);
    return captchaData.validated === true;
  } catch (error) {
    console.error('[CAPTCHA] 验证缓存验证码错误:', error);
    return false;
  }
};

const register = async (req, res) => {
  try {
    const { username, password, nickname, avatar, captchaId } = req.body;

    const captchaValid = await validateCaptcha(captchaId);
    if (!captchaValid) {
      return res.status(400).json({
        success: false,
        message: '请先完成验证码验证',
        data: null
      });
    }

    if (!username || !password || !nickname) {
      return res.status(400).json({
        success: false,
        message: '用户名、密码和昵称不能为空',
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

    if (nickname.length < 2 || nickname.length > 20) {
      return res.status(400).json({
        success: false,
        message: '昵称长度必须在 2-20 个字符之间',
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
      await logRegister(username, { success: false, reason: '用户名已存在' }, req);
      return res.status(400).json({
        success: false,
        message: '用户名已存在',
        data: null
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      nickname,
      avatar: avatar || 'avatar-1',
      lastLoginAt: new Date()
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await logRegister(username, { 
      success: true, 
      userId: user._id,
      nickname,
      avatar: user.avatar 
    }, req);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('[AUTH] 注册错误:', error);
    await logRegister(req.body?.username || 'unknown', { success: false, error: error.message }, req);
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
      await logLogin(username, { success: false, reason: '用户不存在' }, req);
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
        data: null
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await logLogin(username, { success: false, reason: '密码错误' }, req);
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
        data: null
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await logLogin(username, { success: true, userId: user._id }, req);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('[AUTH] 登录错误:', error);
    await logLogin(req.body?.username || 'unknown', { success: false, error: error.message }, req);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试',
      data: null
    });
  }
};

const logout = async (req, res) => {
  try {
    const user = req.user;
    
    if (user) {
      await logLogout(user.username, { success: true, userId: user._id }, req);
    }

    res.json({
      success: true,
      message: '登出成功',
      data: null
    });

  } catch (error) {
    console.error('[AUTH] 登出错误:', error);
    res.status(500).json({
      success: false,
      message: '登出失败，请稍后重试',
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
        nickname: user.nickname,
        avatar: user.avatar,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        lastLoginAt: user.lastLoginAt,
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
  logout,
  getCurrentUser,
  generateSliderCaptcha,
  verifySliderCaptcha
};
