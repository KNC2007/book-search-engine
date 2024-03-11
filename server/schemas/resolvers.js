const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // get a single user by their id or username
    getSingleUser: async (_, { userId, username }) => {
      return await User.findOne({
        $or: [{ _id: userId }, { username: username }],
      });
    },
  },
  Mutation: {
    // create a user
    createUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },

    // login a user
    login: async (_, { username, email, password }) => {
      const user = await User.findOne({
        $or: [{ username: username }, { email: email }],
      });

      if (!user) {
        throw new Error("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new Error('Wrong password!');
      }

      const token = signToken(user);
      return { token, user };
    },

    // save a book to a user's `savedBooks` field
    saveBook: async (_, { bookData }, context) => {
      if (!context.user) {
        throw new Error('Not logged in');
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: bookData } },
        { new: true, runValidators: true }
      );

      return updatedUser;
    },

    // remove a book from `savedBooks`
    deleteBook: async (_, { bookId }, context) => {
      if (!context.user) {
        throw new Error('Not logged in');
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: bookId } } },
        { new: true }
      );

      return updatedUser;
    },
  },
};

module.exports = resolvers;
