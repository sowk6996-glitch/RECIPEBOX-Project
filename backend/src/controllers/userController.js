import User from '../models/User.js';
import Recipe from '../models/Recipe.js';

// @desc    Follow a user
// @route   POST /api/users/follow/:id
export const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    // Add to following/followers arrays
    currentUser.following.push(targetUserId);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    return res.json({ 
      message: `Successfully followed ${userToFollow.username}`,
      following: currentUser.following
    });
  } catch (error) {
    console.error('Follow user error:', error);
    return res.status(500).json({ message: 'Server error during follow operation', error: error.message });
  }
};

// @desc    Unfollow a user
// @route   POST /api/users/unfollow/:id
export const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    const userToUnfollow = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if not following
    if (!currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Pull from arrays
    currentUser.following.pull(targetUserId);
    userToUnfollow.followers.pull(currentUserId);

    await currentUser.save();
    await userToUnfollow.save();

    return res.json({ 
      message: `Successfully unfollowed ${userToUnfollow.username}`,
      following: currentUser.following
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    return res.status(500).json({ message: 'Server error during unfollow operation', error: error.message });
  }
};

// @desc    Get custom feed (recipes of users current user is following)
// @route   GET /api/feed
export const getFeed = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followingIds = currentUser.following;

    // Get all recipes where author exists in the user's following list
    const total = await Recipe.countDocuments({ author: { $in: followingIds } });
    const recipes = await Recipe.find({ author: { $in: followingIds } })
      .populate('author', 'username profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      recipes,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Fetch feed error:', error);
    return res.status(500).json({ message: 'Server error fetching feed', error: error.message });
  }
};

// @desc    Get public profile of another user
// @route   GET /api/users/:id/profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email') // hide sensitive data
      .populate('followers', 'username profileImage')
      .populate('following', 'username profileImage');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also fetch their recipes
    const recipes = await Recipe.find({ author: req.params.id }).sort({ createdAt: -1 });

    return res.json({
      user,
      recipes
    });
  } catch (error) {
    console.error('Fetch user profile error:', error);
    return res.status(500).json({ message: 'Server error fetching user profile', error: error.message });
  }
};
