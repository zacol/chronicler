const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const deepPopulate = require('mongoose-deep-populate')(mongoose);

const { Schema } = mongoose;

// Define `User` Schema
const UserSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, lowercase: true, trim: true },
    profiles: {
      'google-plus': { type: Object },
    },
  },
  {
    timestamps: true,
  }
);

// Define Schema Indexes for `MongoDB`
UserSchema.index({ firstName: 1, lastName: 1 });

// Define Schema toObject options
UserSchema.set('toObject', { getters: true });
UserSchema.set('toJSON', { getters: true });

/**
 * -- Model's Plugin Extensions
 */

UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(deepPopulate);

/**
 * -- Model's API Extension
 */

/**
 * Find `User` by its email
 *
 * @param {String} email
 * @return {Error} err
 * @return {User} user
 * @api public
 */
UserSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email });
};

/**
 * Find `User` by social provider id
 *
 * @param {Object} profile
 * @return {Error} err
 * @return {User} user
 * @api public
 */
UserSchema.statics.findByProvider = function findByProvider(profile) {
  const path = `profiles.${profile.provider}.id`;
  const query = {};

  query[path] = profile.id;

  return this.findOne(query);
};

module.exports = mongoose.model('User', UserSchema);
