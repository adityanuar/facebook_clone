const {
  validateEmail,
  validateLength,
  validateUsername,
} = require("../helpers/validation");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { generateToken } = require("../helpers/tokens");
const { sendVerificationEmail } = require("../helpers/mailer");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      username,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "invalid email address" });
    }
    const check = await User.findOne({ email });
    if (check) {
      return res
        .status(400)
        .json({ message: "Email address already existed, try another one!" });
    }

    if (!validateLength(first_name, 3, 30)) {
      return res
        .status(400)
        .json({ message: "First name must be between 3 and 30 characters!" });
    }

    if (!validateLength(last_name, 3, 30)) {
      return res
        .status(400)
        .json({ message: "Last name must be between 3 and 30 characters!" });
    }

    if (!validateLength(password, 3, 30)) {
      return res
        .status(400)
        .json({ message: "Password must be between 3 and 30 characters!" });
    }
    const cryptedPassword = await bcrypt.hash(password, 12);
    let tempUsername = first_name + last_name;
    let newUsername = await validateUsername(tempUsername);
    const user = await new User({
      first_name,
      last_name,
      email,
      password: cryptedPassword,
      username: newUsername,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();
    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );
    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, url);
    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      message: "Register Success! please activate your email to start",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.activateAccount = async (req, res) => {
  const { token } = req.body;
  const user = jwt.verify(token, process.env.TOKEN_SECRET);
  console.log(user);
  const check = await User.findById(user.id);
  console.log(check);
  if (check.verified == true) {
    return res.status(400).json({ mesage: "this email is already activated!" });
  } else {
    await User.findByIdAndUpdate(user.id, { verified: true });
    return res
      .status(200)
      .json({ message: "Account has been activated successfully" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "the email address you entered is not connected to an account",
      });
    }
    const check = await bcrypt.compare(password, user.password);
    console.log(check);
    if (!check) {
      return res.status(400).json({
        message: "Invalid credential. Please try again.",
      });
    }
    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      message: "Login Success!",
    });
  } catch (error) {
    res.status(500).json({ message: error.mesage });
  }
};
