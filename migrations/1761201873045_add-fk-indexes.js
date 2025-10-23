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
    console.log("Adding indexes to foreign key columns...");
    pgm.addIndex('orders', 'user_id');
    pgm.addIndex('order_items', 'order_id');
    pgm.addIndex('order_items', 'product_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    console.log("Dropping foreign key indexes...");
    pgm.dropIndex('orders', 'user_id');
    pgm.dropIndex('order_items', 'order_id');
    pgm.dropIndex('order_items', 'product_id');
};
