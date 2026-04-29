const roomService = require('../services/roomService');
const onlinePlayersService = require('../services/onlinePlayersService');

const getRooms = async (req, res) => {
  try {
    const { region = '华东一区' } = req.query;
    const rooms = await roomService.getRooms(region);
    
    res.json({
      success: true,
      message: '获取房间列表成功',
      data: {
        region,
        rooms
      }
    });
  } catch (error) {
    console.error('[LOBBY] 获取房间列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取房间列表失败',
      data: null
    });
  }
};

const getRoom = async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const { region = '华东一区' } = req.query;
    
    const room = await roomService.getRoomByNumber(parseInt(roomNumber), region);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: '房间不存在',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: '获取房间信息成功',
      data: {
        room
      }
    });
  } catch (error) {
    console.error('[LOBBY] 获取房间信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取房间信息失败',
      data: null
    });
  }
};

const getOnlinePlayers = async (req, res) => {
  try {
    const players = await onlinePlayersService.getOnlinePlayers();
    
    res.json({
      success: true,
      message: '获取在线玩家列表成功',
      data: {
        count: players.length,
        players
      }
    });
  } catch (error) {
    console.error('[LOBBY] 获取在线玩家列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取在线玩家列表失败',
      data: null
    });
  }
};

const sitDown = async (req, res) => {
  try {
    const { roomNumber, region = '华东一区' } = req.body;
    const userId = req.user._id;
    
    if (!roomNumber) {
      return res.status(400).json({
        success: false,
        message: '房间号不能为空',
        data: null
      });
    }
    
    const result = await roomService.sitDown(userId, parseInt(roomNumber), region);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('[LOBBY] 坐下失败:', error);
    res.status(500).json({
      success: false,
      message: '坐下失败',
      data: null
    });
  }
};

const leaveRoom = async (req, res) => {
  try {
    const { region = '华东一区' } = req.body;
    const userId = req.user._id;
    
    const result = await roomService.leaveRoom(userId, region);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('[LOBBY] 离开房间失败:', error);
    res.status(500).json({
      success: false,
      message: '离开房间失败',
      data: null
    });
  }
};

const quickStart = async (req, res) => {
  try {
    const { region = '华东一区' } = req.body;
    const userId = req.user._id;
    
    const result = await roomService.quickStart(userId, region);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('[LOBBY] 快速开始失败:', error);
    res.status(500).json({
      success: false,
      message: '快速开始失败',
      data: null
    });
  }
};

module.exports = {
  getRooms,
  getRoom,
  getOnlinePlayers,
  sitDown,
  leaveRoom,
  quickStart
};
