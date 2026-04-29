const Room = require('../models/Room');
const User = require('../models/User');
const onlinePlayersService = require('./onlinePlayersService');
const tableRedisService = require('./tableRedisService');

const TOTAL_TABLES = 99;

const formatRoomData = (room) => {
  if (!room) return null;
  
  return {
    id: room._id ? room._id.toString() : `virtual-${room.region}-${room.roomNumber}`,
    number: room.roomNumber || room.number,
    status: room.status || 'empty',
    region: room.region,
    rules: room.rules || { timeLimit: 30, quickStart: false },
    player1: room.player1 ? {
      id: room.player1._id ? room.player1._id.toString() : room.player1.id || room.player1,
      name: room.player1.nickname || room.player1.name || room.player1.username || null,
      username: room.player1.username || null,
      avatar: room.player1.avatar || null,
      wins: room.player1.wins || 0,
      losses: room.player1.losses || 0,
      draws: room.player1.draws || 0
    } : null,
    player2: room.player2 ? {
      id: room.player2._id ? room.player2._id.toString() : room.player2.id || room.player2,
      name: room.player2.nickname || room.player2.name || room.player2.username || null,
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
  async getRooms(region = 'HD1') {
    try {
      return await tableRedisService.getTables(region);
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
  
  async getRoomByNumber(roomNumber, region = 'HD1') {
    try {
      if (roomNumber < 1 || roomNumber > TOTAL_TABLES) {
        return null;
      }
      
      return await tableRedisService.getTable(roomNumber, region);
    } catch (error) {
      console.error('[ROOM_SERVICE] 获取房间失败:', error);
      return formatRoomData(createVirtualRoom(roomNumber, region));
    }
  },
  
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      return user;
    } catch (error) {
      console.error('[ROOM_SERVICE] 获取用户失败:', error);
      return null;
    }
  },
  
  async leaveRoomFromTable(userId, currentTableInfo) {
    const { tableNumber, region, slot } = currentTableInfo;
    
    let table = await tableRedisService.getTable(tableNumber, region);
    if (!table) {
      await tableRedisService.clearPlayerCurrentTable(userId);
      return { success: true, message: '桌位不存在' };
    }
    
    if (slot === 'player1') {
      table.player1 = null;
    } else if (slot === 'player2') {
      table.player2 = null;
    }
    
    table.status = tableRedisService.calculateTableStatus(table);
    
    await tableRedisService.clearPlayerCurrentTable(userId);
    
    if (table.status === 'empty') {
      await tableRedisService.deleteTable(tableNumber, region);
      
      await Room.deleteOne({ roomNumber: tableNumber, region });
      
      await onlinePlayersService.updatePlayerStatus(userId, 'online');
      
      return {
        success: true,
        message: '离开房间成功',
        data: {
          room: formatRoomData(createVirtualRoom(tableNumber, region)),
          slot
        }
      };
    }
    
    await tableRedisService.saveTable(table, region);
    await onlinePlayersService.updatePlayerStatus(userId, 'online');
    
    return {
      success: true,
      message: '离开房间成功',
      data: {
        room: formatRoomData(table),
        slot
      }
    };
  },
  
  async sitDown(userId, roomNumber, region = 'HD1') {
    try {
      if (roomNumber < 1 || roomNumber > TOTAL_TABLES) {
        return { success: false, message: '桌位号无效' };
      }
      
      const currentTableInfo = await tableRedisService.getPlayerCurrentTable(userId);
      
      if (currentTableInfo) {
        if (currentTableInfo.tableNumber === roomNumber && currentTableInfo.region === region) {
          return { success: false, message: '您已经在这个房间了' };
        }
        
        console.log(`[ROOM_SERVICE] 用户切换桌子，离开原有桌位: ${currentTableInfo.region} #${currentTableInfo.tableNumber}`);
        await this.leaveRoomFromTable(userId, currentTableInfo);
      }
      
      let table = await tableRedisService.getTable(roomNumber, region);
      
      const isPlayer1 = table.player1 && table.player1.id === userId.toString();
      const isPlayer2 = table.player2 && table.player2.id === userId.toString();
      
      if (isPlayer1 || isPlayer2) {
        return { success: false, message: '您已经在这个房间了' };
      }
      
      let slot = null;
      if (!table.player1) {
        slot = 'player1';
      } else if (!table.player2) {
        slot = 'player2';
      } else {
        return { success: false, message: '房间已满' };
      }
      
      const user = await this.getUserById(userId);
      if (!user) {
        return { success: false, message: '用户不存在' };
      }
      
      const playerData = tableRedisService.formatPlayerData(user);
      
      if (slot === 'player1') {
        table.player1 = playerData;
      } else {
        table.player2 = playerData;
      }
      
      table.status = tableRedisService.calculateTableStatus(table);
      
      await tableRedisService.saveTable(table, region);
      
      await tableRedisService.setPlayerCurrentTable(userId, roomNumber, region, slot);
      
      await onlinePlayersService.updatePlayerStatus(userId, 'playing');
      
      if (table.status === 'playing') {
        console.log(`[ROOM_SERVICE] 游戏开始，创建正式房间: ${region} #${roomNumber}`);
        
        let room = await Room.findOne({ roomNumber, region });
        
        if (!room) {
          room = new Room({
            roomNumber: roomNumber,
            region: region,
            status: 'playing',
            player1: table.player1.id,
            player2: table.player2.id,
            rules: table.rules
          });
        } else {
          room.status = 'playing';
          room.player1 = table.player1.id;
          room.player2 = table.player2.id;
        }
        
        await room.save();
      }
      
      return {
        success: true,
        message: '坐下成功',
        data: {
          room: formatRoomData(table),
          slot
        }
      };
    } catch (error) {
      console.error('[ROOM_SERVICE] 坐下失败:', error);
      return { success: false, message: '坐下失败' };
    }
  },
  
  async leaveRoom(userId, region = 'HD1') {
    try {
      const currentTableInfo = await tableRedisService.getPlayerCurrentTable(userId);
      
      if (!currentTableInfo) {
        const room = await Room.findOne({
          region,
          $or: [
            { player1: userId },
            { player2: userId }
          ]
        });
        
        if (room) {
          let slot = null;
          if (room.player1 && room.player1.toString() === userId.toString()) {
            slot = 'player1';
            room.player1 = null;
          } else if (room.player2 && room.player2.toString() === userId.toString()) {
            slot = 'player2';
            room.player2 = null;
          }
          
          await onlinePlayersService.updatePlayerStatus(userId, 'online');
          
          if (!room.player1 && !room.player2) {
            await Room.deleteOne({ _id: room._id });
            
            await tableRedisService.deleteTable(room.roomNumber, region);
            
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
          
          const table = await tableRedisService.getTable(room.roomNumber, region);
          if (table) {
            if (slot === 'player1') {
              table.player1 = null;
            } else {
              table.player2 = null;
            }
            table.status = tableRedisService.calculateTableStatus(table);
            await tableRedisService.saveTable(table, region);
          }
          
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
        }
        
        return { success: false, message: '您不在任何房间中' };
      }
      
      return await this.leaveRoomFromTable(userId, currentTableInfo);
    } catch (error) {
      console.error('[ROOM_SERVICE] 离开房间失败:', error);
      return { success: false, message: '离开房间失败' };
    }
  },
  
  async quickStart(userId, region = 'HD1') {
    try {
      const currentTableInfo = await tableRedisService.getPlayerCurrentTable(userId);
      
      if (currentTableInfo) {
        await this.leaveRoomFromTable(userId, currentTableInfo);
      }
      
      const waitingTables = await tableRedisService.getWaitingTables(region);
      
      if (waitingTables.length > 0) {
        const randomIndex = Math.floor(Math.random() * waitingTables.length);
        const targetTable = waitingTables[randomIndex];
        const result = await this.sitDown(userId, targetTable.number, region);
        if (result.success) {
          return result;
        }
      }
      
      const availableNumbers = await tableRedisService.getAvailableTableNumbers(region);
      
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
