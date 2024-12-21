'use strict';

const { Booking } = require('../models'); // Adjust the path as needed

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // Attach schema in production
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const bookings = [
      {
        spotId: 1,
        userId: 1,
        startDate: '2024-12-20',
        endDate: '2024-12-25',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        spotId: 2,
        userId: 2,
        startDate: '2025-01-05',
        endDate: '2025-01-10',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        spotId: 3,
        userId: 3,
        startDate: '2024-12-18',
        endDate: '2024-12-20',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Use Booking model's bulkCreate method to insert data
    await Booking.bulkCreate(bookings, { validate: true }); // Ensures input data meets model validations
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        startDate: {
          [Op.in]: [
            '2024-12-20',
            '2025-01-05',
            '2024-12-18',
          ],
        },
      },
      {}
    );
  },
};
