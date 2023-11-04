const sendToken = (res, user, message) => {
  const token = user.getJWTToken();

  const option = {
    expires: process.env.JWT_EXPIRE,
  };
};
