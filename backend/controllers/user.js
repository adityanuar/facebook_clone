const { validateEmail, validateLength } = require("../helpers/validation");
const User = require("../models/User");
const bcrypt = require("bcrypt");

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
    console.log(cryptedPassword);
    return;
    const user = new User({
      first_name,
      last_name,
      email,
      password,
      username,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
