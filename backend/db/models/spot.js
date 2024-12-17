"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "ownerId" });
      this.hasMany(models.Review, { foreignKey: "spotId" });
      this.hasMany(models.Booking, { foreignKey: "spotId" });
      this.hasMany(models.SpotImage, { foreignKey: "spotId" });
    }
  }

  Spot.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lat: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      lng: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Spot",
      tableName: "Spots",
      timestamps: true, // Adds createdAt and updatedAt automatically
      schema: process.env.NODE_ENV === "production" ? process.env.SCHEMA : undefined,
    }
  );

  return Spot;
};
