import { Router } from "express";
const router = Router();

import { User } from "./models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

const responces = {
  passed: { OK: true, result: 1 },      // Authentication passed
  userNF: { OK: false, result: 2 },     // User not found
  passwordNC: { OK: false, result: 3 }, // Password not correct
  tokenError: { OK: false, result: 4 }  // JWT token error + msg
};

router.post("/", handleAuth);
router.post("/check", handleCheck);
router.post("/refreshToken", handleRefreshToken);
router.post("/logout", handleLogout);

async function handleAuth(req, res, next) {
  const { username, password, remember } = req.body;
  const { auth } = req.cookies;

  /**
   * Authenticatin passed => result: true, status: 1
   * Username not found => result: false, status: 2
   * Password incorrect => result: false, status: 3
   * JWT token error => result: false, status: 4, msg
   */

  const user = await User.findOne({ username: username }, "type password");

  // User not found
  if (!user) return res.send(responces.userNF);

  // If authentication token already exists
  if (auth) {
    try {
      await checkToken(auth);
    } catch (err) {
      return handleInvalidate(res, 4, err);
    }
    return res.status(200).send({...responces.passed, type: user.type});
  }

  // Hasing & authentication
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      { _id: user._id, username, type: user.type },
      process.env.AUTH_TOKEN_SECRET
    );

    return handleSuccess(token, res, user.type, remember);
  } else {
    // Incorrect password
    return res.send(responces.passwordNC);
  }
}

async function handleCheck(req, res, next) {
  const { auth } = req.cookies;

  if (auth) {
    try {
      await jwt.verify(JSON.parse(auth), process.env.AUTH_TOKEN_SECRET);
    } catch (err) {
      return handleInvalidate(res, 4, err);
    }
    return res.status(200).send({ OK: true });
  } else return res.status(401).send({ OK: false });
}

async function handleRefreshToken(req, res, next) {
  const { auth } = req.cookies;

  if (auth) {
    try {
      const _auth = checkToken(auth);

      const newToken = jwt.sign(
        { _id: _auth._id, username: _auth.username, type: _auth.type },
        process.env.AUTH_TOKEN_SECRET
      );

      handleSuccess(newToken, res, user.type, true);
    } catch (err) {
      return handleInvalidate(res, 4, err);
    }
    
    return res.status(200).send({ OK: true });
  } else return res.status(401).send({ OK: false });
}

async function handleLogout(req, res, next) {
  res
    .status(200)
    .cookie("auth", "", {
      secure: process.env.NODE_ENV !== "development",
      httpOnly: true,
      expires: new Date(),
    })
    .clearCookie("auth")
    .send({ OK: true });
}

function handleSuccess(token, res, type, remember) {
  return res
    .status(200)
    .cookie("auth", JSON.stringify(token), {
      secure: process.env.NODE_ENV !== "development",
      httpOnly: true,
      expires: remember && new Date().addDays(7),
    })
    .send({...responces.passed, type: type});
}

function handleInvalidate(res, status, err) {
  return res
    .status(401)
    .cookie("auth", "", {
      secure: process.env.NODE_ENV !== "development",
      httpOnly: true,
      expires: new Date(),
    })
    .clearCookie("auth")
    .send({ OK: false, result: status, msg: err.message });
}

module.exports = router;

export async function checkToken (token) {
  return await jwt.verify(JSON.parse(token), process.env.AUTH_TOKEN_SECRET);
};
