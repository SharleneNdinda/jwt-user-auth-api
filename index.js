const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());

//create users on server memory
const users = [
  {
    id: "1",
    username: "john",
    pass: "john123",
    isAdmin: true,
  },

  {
    id: "2",
    username: "mary",
    pass: "mary123",
    isAdmin: false,
  },
];

let refreshTokens = [];

// ************************** Start login route  **************************

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "mySecretKey", {
    expiresIn: "5m",
  });
};

const generaterRefreshToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "myRefreshSecretKey");
};

app.post("/api/login", (req, res) => {
  const { username, pass } = req.body;
  const user = users.find((u) => {
    return u.username === username && u.pass === pass;
  });
  if (user) {
    // generate and acces token if user is found
    const accessToken = generateAccessToken(user);
    const refreshToken = generaterRefreshToken(user);

    refreshTokens.push(refreshToken);

    // returns user with data after login
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).json("username or password is incorrect");
  }
});

// ************************** End login route  **************************

// ************************** verify if user has rights **************************
const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, "mySecretKey", (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated!");
  }
};
// ************************** verify if user has rights **************************

// ************************** Refresh Token Route **************************

app.post("/api/refresh", (req, res) => {
  // take refresh token from user
  const refreshToken = req.body.token;

  // send error if no token or token is invalid
  if (!refreshToken) return res.status(401).json("not authenticated"); //if empty
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("refresh token not valid");
  }

  //create refresh token, new access token and send to user
  jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
    err && console.log(err);
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generaterRefreshToken(user);

    refreshTokens.push(newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

// ************************** Refresh Token  route  **************************

// ************************** Delete Endpoint / Route  **************************
app.delete("/api/users/:userId", verify, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json("User deleted");
  } else {
    res.status(403).json("Function not allowed");
  }
});
// ************************** Delete Endpoint / Route  **************************

// ************************** Logout route  **************************
app.post("/api/logout", (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json("logged out");
});
// ************************** Logout route  **************************

// load server
app.listen(1000, () => console.log("server running"));
