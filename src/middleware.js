const notFoundMiddleware = (req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
};

const errorHandlerMiddleware = (error, req, res, next) => {
    res.status(error.status || 500).json({
        error: {
            message: error.message
        }
    });
};

module.exports = { notFoundMiddleware, errorHandlerMiddleware };