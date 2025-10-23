/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("order_items", {
    id: { type: 'varchar(255)', primaryKey: true },
    order_id: {
      type: "varchar(255)",
      notNull: true,
      references: '"orders"(id)',
      onDelete: "CASCADE",
    },
    product_id: {
      type: 'varchar(255)',
      notNull: true,
      references: '"products"(id)',
      onDelete: "RESTRICT",
    },
    quantity: { type: "integer", notNull: true },
    price: { type: "decimal(10, 2)", notNull: true },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("order_items");
};
