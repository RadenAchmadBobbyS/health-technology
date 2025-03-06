'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Symptom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Symptom.belongsToMany(models.Disease, {
        through: models.SymptomDiseaseJunction
      });
      models.Disease.belongsToMany(Symptom, {
        through: models.SymptomDiseaseJunction
      });
    }
  }
  Symptom.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Symptom name must not be empty!" },
        notEmpty: { msg: "Symptom name must not be empty!" }
      }
    }
  }, {
    sequelize,
    modelName: 'Symptom',
  });
  return Symptom;
};