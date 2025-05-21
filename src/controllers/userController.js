import User from '../models/userModel';

export async function createUser(userFields) {
  const user = new User();
  user.name = userFields.name;
  user.year = userFields.year;
  user.dev = userFields.dev;
  user.des = userFields.des;
  user.pm = userFields.pm;
  user.core = userFields.core;
  user.mentor = userFields.mentor;
  user.major = userFields.major;
  user.minor = userFields.minor;
  user.birthday = userFields.birthday;
  user.home = userFields.home;
  user.quote = userFields.quote;
  user.favoriteThingOne = userFields.favoriteThingOne;
  user.favoriteThingTwo = userFields.favoriteThingTwo;
  user.favoriteThingThree = userFields.favoriteThingThree;
  user.favoriteDartmouthTradition = userFields.favoriteDartmouthTradition;
  user.funFact = userFields.funFact;
  user.profilePic = userFields.profilePic;
  user.posts = [];

  try {
    const savedUser = await user.save();
    console.log('user created successfully');
    return savedUser;
  } catch (error) {
    throw new Error(`create user error: ${error}`);
  }
}

export async function getUsers() {
  try {
    const users = await User.find();
    console.log('users found successfully');
    return users;
  } catch (error) {
    throw new Error(`get users error: ${error}`);
  }
}

export async function getUser(userId) {
  try {
    const user = await User.findById(userId);
    console.log('user found successfully');
    return user;
  } catch (error) {
    throw new Error(`error getting user: ${error}`);
  }
}

export async function updateUser(userId, userFields) {
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, userFields, { new: true });
    console.log('user updated successfully');
    return updatedUser;
  } catch (error) {
    throw new Error(`update user error: ${error}`);
  }
}

export async function deleteUser(userId) {
  try {
    await User.findByIdAndDelete(userId);
    console.log('user deleted successfully');
  } catch (error) {
    throw new Error(`delete user error: ${error}`);
  }
}
