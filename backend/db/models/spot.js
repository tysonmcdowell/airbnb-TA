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
      },
      address: {
        type: DataTypes.STRING,
      },
      city: {
        type: DataTypes.STRING,
      },
      state: {
        type: DataTypes.STRING,
      },
      country: {
        type: DataTypes.STRING,
      },
      lat: {
        type: DataTypes.DECIMAL,
      },
      lng: {
        type: DataTypes.DECIMAL,
      },
      name: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.STRING,
      },
      price: {
        type: DataTypes.DECIMAL,
        validate: {
          min: 0,
        },
      },
    },
    {
      sequelize,
      modelName: "Spot",
    }
  );

  return Spot;
};
