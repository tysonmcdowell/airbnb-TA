'use strict';

const { Spot, User } = require('../models'); // Import models
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // Attach schema in production
}

module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = 'Users';
    await User.bulkCreate([
      {
        firstName: 'brian',
        lastName: 'rodriguez',
        email: 'demo@user.io',
        username: 'Demo-lition',
        hashedPassword: bcrypt.hashSync('password'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: 'brian',
        lastName: 'rodrig',
        email: 'user1@user.io',
        username: 'FakeUser1',
        hashedPassword: bcrypt.hashSync('password2'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: 'brian',
        lastName: 'roddsaf',
        email: 'user2@user.io',
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password3'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Delete dependent Spots first
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(
      options,
      {
        name: { [Op.in]: ['Modern Loft', 'Cozy Cottage', 'Luxury Condo'] },
      },
      {}
    );

    // Then delete Users
    options.tableName = 'Users';
    await queryInterface.bulkDelete(
      options,
      {
        username: { [Op.in]: ['Demo-lition', 'FakeUser1', 'FakeUser2'] },
      },
      {}
    );
  },
};
