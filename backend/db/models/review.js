"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId" });
      this.belongsTo(models.Spot, { foreignKey: "spotId" });
      this.hasMany(models.ReviewImage, { foreignKey: "reviewId" });
    }
  }
  Review.init(
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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      review: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      stars: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Review",
      tableName: "Reviews",
      timestamps: true, // Automatically adds createdAt and updatedAt
    }
  );
  return Review;
};
