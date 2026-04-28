const mongoClient = require('../config/mongodb');

const ensureDbConnection = async (req, res, next) => {
  try {
    const isConnected = await mongoClient.ensureConnection();

    if (!isConnected) {
      return next(new Error('MongoDB unavailable'));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  ensureDbConnection
};
