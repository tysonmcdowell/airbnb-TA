"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    static associate(models) {
      // A spot belongs to a user (owner)
      Spot.belongsTo(models.User, { foreignKey: "ownerId", as: "Owner" });

      // A spot can have many reviews
      Spot.hasMany(models.Review, { foreignKey: "spotId", onDelete: "CASCADE" });

      // A spot can have many bookings
      Spot.hasMany(models.Booking, { foreignKey: "spotId", onDelete: "CASCADE" });

      // A spot can have many images
      Spot.hasMany(models.SpotImage, { foreignKey: "spotId", onDelete: "CASCADE" });
    }
  }

  Spot.init(
    {
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
        type: DataTypes.DECIMAL(10, 6), // Adjusted precision
        allowNull: false,
      },
      lng: {
        type: DataTypes.DECIMAL(10, 6), // Adjusted precision
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 50], // Ensure name length is reasonable
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2), // Adjusted precision for prices
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Spot",
    }
  );

  return Spot;
};
