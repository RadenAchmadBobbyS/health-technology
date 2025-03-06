"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserProfile.belongsTo(models.User, { foreignKey: "UserId" });
      models.User.hasOne(UserProfile, { foreignKey: "UserId" });
    }
  }
  UserProfile.init(
    {
      gender: DataTypes.STRING,
      UserId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id"
        }
      },
      dateOfBirth: DataTypes.DATE
    },
    {
      sequelize,
      modelName: "UserProfile",
      hooks: {
        beforeUpdate: (profile) => {}
      }
    }
  );
  return UserProfile;
};
