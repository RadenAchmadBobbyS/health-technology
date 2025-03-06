"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Username must not be empty!" },
          notEmpty: { msg: "Username must not be empty!" }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Email must not be empty!" },
          notEmpty: { msg: "Email must not be empty!" }
        }
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Role must not be empty!" },
          notEmpty: { msg: "Role must not be empty!" },
          checkRole(value) {
            if (value !== "user" && value !== "admin") {
              throw new Error("Invalid role");
            }
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Password must not be empty!" },
          notEmpty: { msg: "Password must not be empty!" }
        }
      }
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async (user) => {
          const hash = await bcrypt.hash(user.password, 10);
          user.password = hash;
        }
        // afterCreate: async (user) => {
        //   await sequelize.models.UserProfile.create({
        //     gender: null,
        //     dateOfBirth: null,
        //     UserId: user.id
        //   });
        // }
      },
      modelName: "User"
    }
  );
  return User;
};
