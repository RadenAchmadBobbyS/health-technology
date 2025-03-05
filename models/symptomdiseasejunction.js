"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SymptomDiseaseJunction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SymptomDiseaseJunction.belongsToMany(models.Disease, {
        foreignKey: "DiseaseId"
      });
      models.Disease.hasMany(SymptomDiseaseJunction);

      SymptomDiseaseJunction.belongsToMany(models.Symptom, {
        foreignKey: "SymptomId"
      });
      models.Symptom.hasMany(SymptomDiseaseJunction);
    }
  }
  SymptomDiseaseJunction.init(
    {
      DiseaseId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Diseases",
          key: "id"
        }
      },
      SymptomId: {
        type: DataTypes.INTEGER,
        references: { model: "Symptoms", key: "id" }
      }
    },
    {
      sequelize,
      modelName: "SymptomDiseaseJunction"
    }
  );
  return SymptomDiseaseJunction;
};
