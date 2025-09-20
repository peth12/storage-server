export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    statusCode: status,
    message: err.message || "Internal Server Error",
    details: err.details || undefined
  });
}