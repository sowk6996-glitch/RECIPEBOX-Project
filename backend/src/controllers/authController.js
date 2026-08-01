import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_recipebox_token_key_12345', {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const user = new User({
      username,
      email,
      password,
      profileImage: req.fileUrl || '',
      bio: req.body.bio || ''
    });

    await user.save();

    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      bio: user.bio,
      followers: [],
      following: [],
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email })
      .populate('followers', 'username profileImage')
      .populate('following', 'username profileImage');

    if (user && (await user.comparePassword(password))) {
      return res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        token: generateToken(user._id)
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'username profileImage')
      .populate('following', 'username profileImage');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    if (req.fileUrl) {
      user.profileImage = req.fileUrl;
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('followers', 'username profileImage')
      .populate('following', 'username profileImage');

    return res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
      bio: updatedUser.bio,
      followers: updatedUser.followers,
      following: updatedUser.following,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};
