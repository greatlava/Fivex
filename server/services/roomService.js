const Room = require('../models/Room');
const User = require('../models/User');
const onlinePlayersService = require('./onlinePlayersService');

const TOTAL_TABLES = 99;

const formatRoomData = (room) => {
  if (!room) return null;
  
  return {
    id: room._id || `virtual-${room.region}-${room.roomNumber}`,
    number: room.roomNumber,
    status: room.status || 'empty',
    region: room.region,
    rules: room.rules || { timeLimit: 30, quickStart: false },
    player1: room.player1 ? {
      id: room.player1._id || room.player1,
      name: room.player1.nickname || room.player1.username || null,
      username: room.player1.username || null,
      avatar: room.player1.avatar || null,
      wins: room.player1.wins || 0,
      losses: room.player1.losses || 0,
      draws: room.player1.draws || 0
    } : null,
    player2: room.player2 ? {
      id: room.player2._id || room.player2,
      name: room.player2.nickname || room.player2.username || null,
      username: room.player2.username || null,
      avatar: room.player2.avatar || null,
      wins: room.player2.wins || 0,
      losses: room.player2.losses || 0,
      draws: room.player2.draws || 0
    } : null
  };
};

const createVirtualRoom = (roomNumber, region) => {
  return {
    _id: null,
    roomNumber: roomNumber,
    region: region,
    status: 'empty',
    player1: null,
    player2: null,
    rules: { timeLimit: 30, quickStart: false }
  };
};

const roomService = {
  async getRooms(region = '华东一区') {
    try {
      const existingRooms = await Room.find({ region })
        .sort({ roomNumber: 1 })
        .populate('player1', 'username nickname avatar wins losses draws')
        .populate('player2', 'username nickname avatar wins losses draws');
      
      const roomMap = new Map();
      existingRooms.forEach(room => {
        roomMap.set(room.roomNumber, room);
      });
      
      const allRooms = [];
      for (let i = 1; i <= TOTAL_TABLES; i++) {
        if (roomMap.has(i)) {
          allRooms.push(formatRoomData(roomMap.get(i)));
        } else {
          allRooms.push(formatRoomData(createVirtualRoom(i, region)));
        }
      }
      
      return allRooms;
    } catch (error) {
      console.error('[ROOM_SERVICE] 获取房间列表失败:', error);
      const fallbackRooms = [];
      for (let i = 1; i <= TOTAL_TABLES; i++) {
        fallbackRooms.push(formatRoomData(createVirtualRoom(i, region)));
      }
      return fallbackRooms;
    }
  },
  
  async getRoomById(roomId) {
    try {
      if (!roomId || roomId.startsWith('virtual-')) {
        return null;
      }
      
      const room = await Room.findById(roomId)
        .populate('player1', 'username nickname avatar wins losses draws')
        .populate('player2', 'username nickname avatar wins losses draws');
      
      return room ? formatRoomData(room) : null;
    } catch (error) {
      console.error('[ROOM_SERVICE] 获取房间失败:', error);
      return null;
    }
  },
  
  async getRoomByNumber(roomNumber, region = '华东一区') {
    try {
      if (roomNumber < 1 || roomNumber > TOTAL_TABLES) {
        return null;
      }
      
      const room = await Room.findOne({ roomNumber, region })
        .populate('player1', 'username nickname avatar wins losses draws')
        .populate('player2', 'username nickname avatar wins losses draws');
      
      if (room) {
        return formatRoomData(room);
      }
      
      return formatRoomData(createVirtualRoom(roomNumber, region));
    } catch (error) {
      console.error('[ROOM_SERVICE] 获取房间失败:', error);
      return formatRoomData(createVirtualRoom(roomNumber, region));
    }
  },
  
  async sitDown(userId, roomNumber, region = '华东一区') {
    try {
      if (roomNumber < 1 || roomNumber > TOTAL_TABLES) {
        return { success: false, message: '桌位号无效' };
      }
      
      let room = await Room.findOne({ roomNumber, region });
      
      if (!room) {
        console.log(`[ROOM_SERVICE] 创建新房间: ${region} #${roomNumber}`);
        room = new Room({
          roomNumber: roomNumber,
          region: region,
          status: 'empty',
          player1: null,
          player2: null,
          rules: { timeLimit: 30, quickStart: false }
        });
      }
      
      const isPlayer1 = room.player1 && room.player1.toString() === userId.toString();
      const isPlayer2 = room.player2 && room.player2.toString() === userId.toString();
      
      if (isPlayer1 || isPlayer2) {
        return { success: false, message: '您已经在这个房间了' };
      }
      
      let slot = null;
      if (!room.player1) {
        slot = 'player1';
        room.player1 = userId;
      } else if (!room.player2) {
        slot = 'player2';
        room.player2 = userId;
      } else {
        return { success: false, message: '房间已满' };
      }
      
      if (room.player1 && room.player2) {
        room.status = 'playing';
      } else if (room.player1 || room.player2) {
        room.status = 'waiting';
      } else {
        room.status = 'empty';
      }
      
      await room.save();
      
      await onlinePlayersService.updatePlayerStatus(userId, 'playing');
      
      const updatedRoom = await Room.findById(room._id)
        .populate('player1', 'username nickname avatar wins losses draws')
        .populate('player2', 'username nickname avatar wins losses draws');
      
      return {
        success: true,
        message: '坐下成功',
        data: {
          room: formatRoomData(updatedRoom),
          slot
        }
      };
    } catch (error) {
      console.error('[ROOM_SERVICE] 坐下失败:', error);
      return { success: false, message: '坐下失败' };
    }
  },
  
  async leaveRoom(userId, region = '华东一区') {
    try {
      const room = await Room.findOne({
        region,
        $or: [
          { player1: userId },
          { player2: userId }
        ]
      });
      
      if (!room) {
        return { success: false, message: '您不在任何房间中' };
      }
      
      let slot = null;
      if (room.player1 && room.player1.toString() === userId.toString()) {
        room.player1 = null;
        slot = 'player1';
      } else if (room.player2 && room.player2.toString() === userId.toString()) {
        room.player2 = null;
        slot = 'player2';
      }
      
      await onlinePlayersService.updatePlayerStatus(userId, 'online');
      
      if (!room.player1 && !room.player2) {
        console.log(`[ROOM_SERVICE] 删除空房间: ${region} #${room.roomNumber}`);
        await Room.deleteOne({ _id: room._id });
        
        return {
          success: true,
          message: '离开房间成功',
          data: {
            room: formatRoomData(createVirtualRoom(room.roomNumber, region)),
            slot
          }
        };
      }
      
      if (room.player1 && room.player2) {
        room.status = 'playing';
      } else if (room.player1 || room.player2) {
        room.status = 'waiting';
      } else {
        room.status = 'empty';
      }
      
      await room.save();
      
      const updatedRoom = await Room.findById(room._id)
        .populate('player1', 'username nickname avatar wins losses draws')
        .populate('player2', 'username nickname avatar wins losses draws');
      
      return {
        success: true,
        message: '离开房间成功',
        data: {
          room: formatRoomData(updatedRoom),
          slot
        }
      };
    } catch (error) {
      console.error('[ROOM_SERVICE] 离开房间失败:', error);
      return { success: false, message: '离开房间失败' };
    }
  },
  
  async quickStart(userId, region = '华东一区') {
    try {
      const currentRoom = await Room.findOne({
        $or: [
          { player1: userId },
          { player2: userId }
        ]
      });
      
      if (currentRoom) {
        await this.leaveRoom(userId, currentRoom.region);
      }
      
      const waitingRooms = await Room.find({
        region,
        status: 'waiting'
      });
      
      if (waitingRooms.length > 0) {
        const randomIndex = Math.floor(Math.random() * waitingRooms.length);
        const targetRoom = waitingRooms[randomIndex];
        const result = await this.sitDown(userId, targetRoom.roomNumber, region);
        if (result.success) {
          return result;
        }
      }
      
      const occupiedNumbers = new Set();
      const existingRooms = await Room.find({ region }, { roomNumber: 1 });
      existingRooms.forEach(room => occupiedNumbers.add(room.roomNumber));
      
      const availableNumbers = [];
      for (let i = 1; i <= TOTAL_TABLES; i++) {
        if (!occupiedNumbers.has(i)) {
          availableNumbers.push(i);
        }
      }
      
      if (availableNumbers.length === 0) {
        return { success: false, message: '没有可用的房间' };
      }
      
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const targetNumber = availableNumbers[randomIndex];
      
      return await this.sitDown(userId, targetNumber, region);
      
    } catch (error) {
      console.error('[ROOM_SERVICE] 快速开始失败:', error);
      return { success: false, message: '快速开始失败' };
    }
  }
};

module.exports = roomService;
