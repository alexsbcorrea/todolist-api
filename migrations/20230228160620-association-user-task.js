"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addConstraint("tasks", {
      fields: ["idUser"],
      type: "foreign key",
      name: "association-user-task",
      references: {
        table: "users",
        field: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeConstraint("tasks", "association-user-task");
  },
};
