const regionService = require('../services/regionService');

const getRegions = async (req, res) => {
  try {
    const regions = await regionService.getAllRegions();
    
    res.json({
      success: true,
      message: '获取大区列表成功',
      data: {
        regions
      }
    });
  } catch (error) {
    console.error('[REGION] 获取大区列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取大区列表失败',
      data: null
    });
  }
};

const createRegion = async (req, res) => {
  try {
    const { name, code, sort = 0 } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: '大区名称和代码不能为空',
        data: null
      });
    }
    
    const region = await regionService.createRegion(name, code, sort);
    
    res.status(201).json({
      success: true,
      message: '创建大区成功',
      data: {
        region
      }
    });
  } catch (error) {
    console.error('[REGION] 创建大区失败:', error);
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: '大区代码已存在',
        data: null
      });
    } else {
      res.status(500).json({
        success: false,
        message: '创建大区失败',
        data: null
      });
    }
  }
};

const updateRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, sort } = req.body;
    
    const updates = {};
    if (name) updates.name = name;
    if (code) updates.code = code;
    if (sort !== undefined) updates.sort = sort;
    
    const region = await regionService.updateRegion(id, updates);
    
    if (!region) {
      return res.status(404).json({
        success: false,
        message: '大区不存在',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: '更新大区成功',
      data: {
        region
      }
    });
  } catch (error) {
    console.error('[REGION] 更新大区失败:', error);
    res.status(500).json({
      success: false,
      message: '更新大区失败',
      data: null
    });
  }
};

const deleteRegion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await regionService.deleteRegion(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: '大区不存在',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: '删除大区成功',
      data: null
    });
  } catch (error) {
    console.error('[REGION] 删除大区失败:', error);
    res.status(500).json({
      success: false,
      message: '删除大区失败',
      data: null
    });
  }
};

module.exports = {
  getRegions,
  createRegion,
  updateRegion,
  deleteRegion
};
