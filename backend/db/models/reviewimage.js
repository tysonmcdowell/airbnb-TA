"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ReviewImage extends Model {
    static associate(models) {
      this.belongsTo(models.Review, { foreignKey: "reviewId" });
    }
  }
  ReviewImage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      reviewId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ReviewImage",
      tableName: "ReviewImages",
      timestamps: true, // Automatically adds createdAt and updatedAt
    }
  );
  return ReviewImage;
};
