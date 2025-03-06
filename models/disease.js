"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Disease extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Disease.belongsToMany(models.Symptom, {
        through: models.SymptomDiseaseJunction
      });
      models.Symptom.belongsToMany(Disease, {
        through: models.SymptomDiseaseJunction
      });
    }
  }
  Disease.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Disease name must not be empty!" },
          notEmpty: { msg: "Disease name must not be empty!" }
        }
      },
      description: DataTypes.TEXT,
      level: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "Disease"
    }
  );
  return Disease;
};
