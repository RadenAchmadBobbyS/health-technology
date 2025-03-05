"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Diagnostic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Diagnostic.belongsTo(models.User, { foreignKey: "UserId" });
      models.User.hasMany(Diagnostic);

      Diagnostic.belongsTo(models.Disease, { foreignKey: "DiseaseId" });
      models.Disease.hasMany(Diagnostic);
    }
  }
  Diagnostic.init(
    {
      DiseaseId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Diseases",
          key: "id"
        }
      },
      UserId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id"
        }
      }
    },
    {
      sequelize,
      modelName: "Diagnostic"
    }
  );
  return Diagnostic;
};
