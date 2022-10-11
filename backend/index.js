const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());
const users = [
  {
    id: 1,
    username: "john",
    password: "john0809",
    isAdmin: true,
  },
  {
    id: 2,
    username: "saad",
    password: "face2468",
    isAdmin: false,
  },
];
const refreshTokens = [];

app.post("api/refresh", (req, res) => {
  // take the refresh token
  const refreshToken = req.body.token;
  // send err if there is no token or invalid
    if (!refreshToken) return res.status(401).json("You are not authorized");
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403).json("RefreshToken is not Valid");
    }
    jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
        err && console.log(err);
        refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokens.push(newRefreshToken);
        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken:newRefreshToken,
        });
    });
    // if everything is ok 
});

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "mySecretKey", {
    expresIn: "15m",
  });
};
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "myRefreshSecretKey");
};

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });
  if (user) {
    // Generate an accesToken
    const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      refreshTokens.push(refreshToken);
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
        accessToken,
      refreshToken
    });
  } else {
    res.status.json("Username or Password incorrect!");
  }
});

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
      const token = authHeader.split(" ")[1];
    jwt.verify(token, "mySecretKey", (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authorized");
  }
};

app.delete("/api/users/:userId", verify, (req, res) => {
    if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json("User has been deleted");
  } else {
    res.status(403).json("You are not allowed to delete this user");
  }
});

app.post("/api/logout", verify, (req, res) => {
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    res.status(200).json("You are loged out successfuly!")
});

app.listen(5000, () => "Backend server is running ");