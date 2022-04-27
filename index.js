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

app.post("/api/login", (req, res) => {
  const { username, pass } = req.body;
  const user = users.find((u) => {
    return u.username === username && u.pass === pass;
  });
  if (user) {
    // generate and acces token if user is found
    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      "mySecretKey"
    );
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
    });
  } else {
    res.status(400).json("username or pass incorrect");
  }
});

// verify if user has rights

app.listen(1000, () => console.log("server running"));
