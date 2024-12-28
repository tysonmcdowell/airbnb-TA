'use strict';

const { Spot } = require('../models'); // Import Spot model

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // Attach schema in production
}

module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const spots = [
      {
        ownerId: 1,
        address: '123 Main Street',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        lat: 34.0522,
        lng: -118.2437,
        name: 'Modern Loft',
        description: 'A beautiful loft in downtown LA.',
        price: 200.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ownerId: 2,
        address: '456 Elm Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        lat: 37.7749,
        lng: -122.4194,
        name: 'Cozy Cottage',
        description: 'A quaint and cozy cottage.',
        price: 150.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ownerId: 3,
        address: '789 Pine Avenue',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        lat: 40.7128,
        lng: -74.0060,
        name: 'Luxury Condo',
        description: 'A luxurious condo in NYC.',
        price: 300.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await Spot.bulkCreate(spots, { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(
      options,
      {
        name: { [Op.in]: ['Modern Loft', 'Cozy Cottage', 'Luxury Condo'] },
      },
      {}
    );
  },
};
