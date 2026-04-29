const Region = require('../models/Region');

const regionService = {
  async getAllRegions() {
    try {
      const regions = await Region.find()
        .sort({ sort: 1, _id: 1 })
        .select('name code sort');
      return regions;
    } catch (error) {
      console.error('[REGION_SERVICE] 获取大区列表失败:', error);
      throw error;
    }
  },

  async getRegionByCode(code) {
    try {
      const region = await Region.findOne({ code: code.toUpperCase() });
      return region;
    } catch (error) {
      console.error('[REGION_SERVICE] 获取大区失败:', error);
      throw error;
    }
  },

  async createRegion(name, code, sort = 0) {
    try {
      const region = new Region({
        name,
        code: code.toUpperCase(),
        sort
      });
      await region.save();
      return region;
    } catch (error) {
      console.error('[REGION_SERVICE] 创建大区失败:', error);
      throw error;
    }
  },

  async updateRegion(id, updates) {
    try {
      if (updates.code) {
        updates.code = updates.code.toUpperCase();
      }
      const region = await Region.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
      return region;
    } catch (error) {
      console.error('[REGION_SERVICE] 更新大区失败:', error);
      throw error;
    }
  },

  async deleteRegion(id) {
    try {
      const result = await Region.findByIdAndDelete(id);
      return result;
    } catch (error) {
      console.error('[REGION_SERVICE] 删除大区失败:', error);
      throw error;
    }
  },

  async getDefaultRegion() {
    try {
      const regions = await this.getAllRegions();
      if (regions.length > 0) {
        return regions[0];
      }
      return null;
    } catch (error) {
      console.error('[REGION_SERVICE] 获取默认大区失败:', error);
      throw error;
    }
  },

  async validateRegionCode(code) {
    if (!code) return false;
    try {
      const region = await this.getRegionByCode(code);
      return !!region;
    } catch (error) {
      console.error('[REGION_SERVICE] 验证大区代码失败:', error);
      return false;
    }
  }
};

module.exports = regionService;
