require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/Room');

const regionNameToCode = {
  '华东一区': 'HD1',
  '华东二区': 'HD2',
  '华北一区': 'HB1',
  '华北二区': 'HB2',
  '华南一区': 'HN1',
  '华南二区': 'HN2'
};

const migrateRooms = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not configured in .env file');
    }

    console.log('[MIGRATE_REGIONS] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[MIGRATE_REGIONS] Connected to MongoDB');

    const rooms = await Room.find();
    console.log(`[MIGRATE_REGIONS] Found ${rooms.length} rooms to check`);

    let migratedCount = 0;
    let alreadyMigratedCount = 0;
    let unknownCount = 0;

    for (const room of rooms) {
      const currentRegion = room.region;
      
      if (regionNameToCode[currentRegion]) {
        const newCode = regionNameToCode[currentRegion];
        room.region = newCode;
        await room.save();
        console.log(`  - Room #${room.roomNumber}: migrated "${currentRegion}" -> "${newCode}"`);
        migratedCount++;
      } else if (Object.values(regionNameToCode).includes(currentRegion)) {
        console.log(`  - Room #${room.roomNumber}: already using code "${currentRegion}"`);
        alreadyMigratedCount++;
      } else {
        console.log(`  - Room #${room.roomNumber}: unknown region "${currentRegion}"`);
        unknownCount++;
      }
    }

    console.log('\n[MIGRATE_REGIONS] Migration summary:');
    console.log(`  - Total rooms: ${rooms.length}`);
    console.log(`  - Migrated: ${migratedCount}`);
    console.log(`  - Already using code: ${alreadyMigratedCount}`);
    console.log(`  - Unknown regions: ${unknownCount}`);

    console.log('\n[MIGRATE_REGIONS] Note: Redis data (tables, player current tables)');
    console.log('also uses region values. You may need to clear Redis or run');
    console.log('an additional migration for Redis data if necessary.');

    await mongoose.disconnect();
    console.log('[MIGRATE_REGIONS] Disconnected from MongoDB');

  } catch (error) {
    console.error('[MIGRATE_REGIONS] Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

migrateRooms();
