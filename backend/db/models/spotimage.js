"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SpotImage extends Model {
    static associate(models) {
      this.belongsTo(models.Spot, { foreignKey: "spotId" });
    }
  }
  SpotImage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      spotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      preview: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "SpotImage",
      tableName: "SpotImages",
      timestamps: true, // Automatically adds createdAt and updatedAt
    }
  );
  return SpotImage;
};
