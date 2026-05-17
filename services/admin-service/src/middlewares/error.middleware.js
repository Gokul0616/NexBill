const errorHandler = (err, req, res, next) => {
    console.error('Admin Service Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
