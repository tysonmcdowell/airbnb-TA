"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId" });
      this.belongsTo(models.Spot, { foreignKey: "spotId" });
    }
  }
  Booking.init(
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
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Booking",
      tableName: "Bookings",
      timestamps: true, // Automatically adds createdAt and updatedAt
    }
  );
  return Booking;
};
