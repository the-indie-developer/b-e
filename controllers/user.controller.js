import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { sendEmail } from "../uttils/email.js";
import { newUserOtp } from "../models/authViaOtp.model.js";

//----------------------- AUTHENTICATION AND CREATING USER---------------------->

const genNewUserOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Invalid Email",
      });
    }
    const existing = await User.findOne({ email: email });
    if (existing) {
      return res.status(404).send({
        success: false,
        message: "Account with this email already exists !",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tempSaveEmailAndOtp = new newUserOtp({ email: email, otp: otp });
    await tempSaveEmailAndOtp.save();

    try {
      await sendEmail({
        email: email,
        message: `Your OTP is: ${otp}. It will expire in 30 minutes.`,
        subject: `Your OTP for MeriPehchaan Signup`,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Failed to send the OTP!",
      });
    }
    return res.status(200).send({
      success: true,
      message: `OTP sent to ${email} successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

const verifyNewUserOtpAndSignIn = async (req, res) => {
  try {
    const { fullname, email, otp, password, role } = req.body;
    if (!email || !otp || !fullname || !password || !role) {
      return res.status(400).send({
        success: false,
        message: "Provide the All Fields",
      });
    }

    const checkOTP = await newUserOtp.findOne({ otp });
    if (!checkOTP) {
      return res.status(404).send({
        success: false,
        message: "Invalid OTP",
      });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(404).send({
        success: false,
        message: "User Already Exist With This Email !",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      fullname,
      role,
      password: hashedPassword,
    });

    await newUser.save();

    try {
      await sendEmail({
        email: email,
        subject: "Welcome to Meri Pehchaan! Your Journey Starts Now!",
        message: `Hello, ${fullname},

Thank you for joining Meri Pehchaan!

We are thrilled to have you as part of our community. Together, we can build a better tomorrow.

You are now ready to:

Explore Programs: Discover our various programs and initiatives.

Make a Donation: Support those in need by contributing financially.

Become a Volunteer: Join our team and start making an impact.

Let's make a difference together.

Sincerely,

The Meri Pehchaan Team`,
      });
    } catch (error) {
      console.log("Email sending error :", error);
    }

    return res.status(200).send({
      success: true,
      message: "SignUp successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error creating account",
    });
  }
};

//--------------------------LOGGING IN USER--------------------------->

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      // BASIC CHECKING OF CREDENTIALS
      return res.status(400).send({
        success: false,
        message: "provide the credentials",
      });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(402).send({
        success: false,
        message: "invalid email or Password",
      });
    }
    const token = JWT.sign({ id: user._id }, process.env.JWT_KEY, {
      expiresIn: "1d",
    });
    user.password = undefined;

    try {
      await sendEmail({
        email: email,
        subject: "Alert: New Login to Your Account",
        message: `Hello, ${user.fullname}

This email is to inform you that there has been a new login to your account.

If this was not you, please secure your account immediately by changing your password.

If this was you, you can safely ignore this email.

Stay safe,

The Meri Pehchaan Team`,
      });
    } catch (error) {
      console.log(error);
    }

    return res.status(200).send({
      success: true,
      token,
      user,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "INTERNAL SERVER ERROR",
      error,
    });
  }
};

//-----------------------------ACCOUNT RECOVERY------------------------------------>

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Enter the email",
      });
    }
    const checkEmail = await User.findOne({ email: email });
    if (!checkEmail) {
      return res.status(200).json({
        success: true,
        message:
          "If a user with that email exists, a password reset link has been sent",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    checkEmail.resetPasswordOTP = otp;
    checkEmail.resetPasswordExpire = Date.now() + 3600000;
    await checkEmail.save();

    const message = `Hello,
    
Your One-Time Password (OTP) for password reset is: ${otp}.
This OTP is valid for 5 minutes.
    
If you did not request this, please ignore this email.
    
Sincerely,
The Meri Pehchaan Team`;

    await sendEmail({
      email: email,
      message: message,
      subject: "Password Reset OTP",
    });

    return res.status(200).json({
      success: true,
      message: "sucessfull",
    });
  } catch (error) {
    console.error("An internal server error occurred:", error);

    res.status(500).json({
      success: false,
      message: "Failed to process",
    });
  }
};

const checkOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    if (!otp || !email) {
      return res.status(400).send({
        success: false,
        message: "Please provide the email and OTP.",
      });
    }

    const user = await User.findOne({ email });

    if (
      !user ||
      !user.resetPasswordOTP ||
      user.resetPasswordExpire < Date.now()
    ) {
      return res.status(400).send({
        success: false,
        message: "Invalid or expired OTP. Please try again.",
      });
    }

    if (otp !== user.resetPasswordOTP) {
      return res.status(400).send({
        success: false,
        message: "Incorrect OTP. Please check your email.",
      });
    }

    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    await user.save();

    return res.status(200).send({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and a new password.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been successfully updated.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//-----------------------------END OF ACCOUNT RECOVERY------------------------------>

const getProfilePic = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).send({
        success: false,
        message: "Require Id",
      });
    }
    const pic = await User.findOne({ _id: id });
    if (!pic) {
      return res.status(404).send({
        success: false,
        message: "User not found!",
      });
    }

    return res.status(200).send({
      success: true,
      picUrl: pic.profilePic,
    });
  } catch (error) {
    console.log("server error :", error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

//----------------------------HANDLING  PROFILE UPDATES ---------------------------->

const handleProfileUpdate = async (req, res) => {
  try {
    const { id } = req.body;
    const updates = req.body;
    if (!id) {
      return res.status(400).send({
        success: false,
        message: "provide the ID",
      });
    }
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found !",
      });
    }

    Object.keys(updates).forEach((key) => (user[key] = updates[key]));

    await user.save();

    return res.status(200).send({
      success: true,
      message: "Updated Successfully",
      user,
    });
  } catch (error) {
    console.log("Error while changing program : ", error);
    res.status(500).send({
      success: false,
      message: "Faided to update profie !",
    });
  }
};

export {
  loginUser,
  forgotPassword,
  checkOtp,
  resetPassword,
  getProfilePic,
  genNewUserOtp,
  verifyNewUserOtpAndSignIn,
  handleProfileUpdate,
};
