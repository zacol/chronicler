const { NOT_FOUND, OK } = require('http-status-codes');

const config = require('../config');
const { findDocuments, getDocument } = require('../utils');
const User = require('../models/user');

module.exports = {
  /**
   * Creating new user is handled by auth registration
   */

  find: (req, res, next) => {
    try {
      findDocuments(req, res, User, config);
    } catch (err) {
      next(err);
    }
  },

  get: (req, res, next) => {
    try {
      getDocument(req, res, User);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { userId } = req.value.params;
      const user = await User.findByIdAndUpdate(userId, req.value.body, {
        new: true,
      });

      res.status(OK).json(user);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { userId } = req.value.params;
      const user = await User.findByIdAndRemove(userId);

      if (!user) {
        return res.sendStatus(NOT_FOUND);
      }

      res.status(OK).json(user);
    } catch (err) {
      next(err);
    }
  },
};
