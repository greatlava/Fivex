const ERROR_CODE = 'OPERATION_FAILED';

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error('[ERROR]', req.method, req.originalUrl);
  console.error(error?.stack || error);

  res.status(error?.statusCode || 500).json({
    success: false,
    code: ERROR_CODE,
    message: '操作失败',
    data: null
  });
};

module.exports = errorHandler;
