module.exports = (req, res, next) => {
  // Sau này có thể kiểm tra JWT token ở đây
  next();
};