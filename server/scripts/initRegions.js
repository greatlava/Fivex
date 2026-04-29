require('dotenv').config();
const mongoose = require('mongoose');
const Region = require('../models/Region');

const defaultRegions = [
  { name: '华东一区', code: 'HD1', sort: 1 },
  { name: '华东二区', code: 'HD2', sort: 2 },
  { name: '华北一区', code: 'HB1', sort: 3 },
  { name: '华北二区', code: 'HB2', sort: 4 },
  { name: '华南一区', code: 'HN1', sort: 5 },
  { name: '华南二区', code: 'HN2', sort: 6 }
];

const regionNameToCode = {
  '华东一区': 'HD1',
  '华东二区': 'HD2',
  '华北一区': 'HB1',
  '华北二区': 'HB2',
  '华南一区': 'HN1',
  '华南二区': 'HN2'
};

const initRegions = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not configured in .env file');
    }

    console.log('[INIT_REGIONS] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[INIT_REGIONS] Connected to MongoDB');

    const existingRegions = await Region.find();
    
    if (existingRegions.length > 0) {
      console.log('[INIT_REGIONS] Regions already exist in database:');
      existingRegions.forEach(r => {
        console.log(`  - ${r.name} (${r.code}), sort: ${r.sort}`);
      });
      
      console.log('\n[INIT_REGIONS] If you want to reset regions, you can:');
      console.log('  1. Manually delete existing regions from database');
      console.log('  2. Or modify this script to update existing regions');
    } else {
      console.log('[INIT_REGIONS] Creating default regions...');
      
      for (const regionData of defaultRegions) {
        const region = new Region(regionData);
        await region.save();
        console.log(`  - Created: ${region.name} (${region.code})`);
      }
      
      console.log('[INIT_REGIONS] All regions created successfully!');
    }

    console.log('\n[INIT_REGIONS] Region name to code mapping:');
    for (const [name, code] of Object.entries(regionNameToCode)) {
      console.log(`  ${name} -> ${code}`);
    }

    console.log('\n[INIT_REGIONS] Important: If you have existing data with Chinese region names,');
    console.log('you need to migrate them to use the new code format.');
    console.log('Example migration: Update "华东一区" to "HD1" in Room documents.');

    await mongoose.disconnect();
    console.log('[INIT_REGIONS] Disconnected from MongoDB');

  } catch (error) {
    console.error('[INIT_REGIONS] Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

initRegions();
