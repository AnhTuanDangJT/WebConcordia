function errorMiddleware(err, req, res, next) {
    console.error(err);
  
    // This causes further errors to be printed in the console log: 
    // cannot modify headers after having been sent to the client
    /* 
    const statusCode = err.statusCode || 500;
  
    res.status(statusCode).json({
      success: false,
      message: err.message || "Internal server error",
      errors: err.errors || undefined,
    });
    */
  }
  
  module.exports = errorMiddleware;