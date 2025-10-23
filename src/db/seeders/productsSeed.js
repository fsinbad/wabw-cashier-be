import { randomUUID } from 'node:crypto';

const productsDummy = [
    // jp
    { id: `prod-${randomUUID()}`, name: 'Tonkotsu Ramen', price: 75000, category: 'Food', stock: 40 },
    { id: `prod-${randomUUID()}`, name: 'Salmon Sushi Set (8 pcs)', price: 95000, category: 'Food', stock: 25 },
    { id: `prod-${randomUUID()}`, name: 'Chicken Katsu Curry', price: 68000, category: 'Food', stock: 35 },
    { id: `prod-${randomUUID()}`, name: 'Iced Ocha', price: 15000, category: 'Beverage', stock: 100 },
    // italian
    { id: `prod-${randomUUID()}`, name: 'Margherita Pizza', price: 85000, category: 'Food', stock: 20 },
    { id: `prod-${randomUUID()}`, name: 'Spaghetti Carbonara', price: 78000, category: 'Food', stock: 30 },
    { id: `prod-${randomUUID()}`, name: 'Tiramisu', price: 45000, category: 'Dessert', stock: 25 },
    { id: `prod-${randomUUID()}`, name: 'Espresso', price: 22000, category: 'Beverage', stock: 100 },
    // us
    { id: `prod-${randomUUID()}`, name: 'Classic Beef Burger', price: 65000, category: 'Food', stock: 45 },
    { id: `prod-${randomUUID()}`, name: 'BBQ Back Ribs', price: 155000, category: 'Food', stock: 15 },
    { id: `prod-${randomUUID()}`, name: 'Chocolate Milkshake', price: 35000, category: 'Beverage', stock: 40 },
    // fr
    { id: `prod-${randomUUID()}`, name: 'Crème Brûlée', price: 42000, category: 'Dessert', stock: 30 },
    { id: `prod-${randomUUID()}`, name: 'Café au Lait', price: 28000, category: 'Beverage', stock: 60 },
];

export const seedProducts = async (client) => {
    console.log("Seeding products...");
    for (const product of productsDummy) {
        const existingProduct = await client.query(
            "SELECT * FROM products WHERE name = $1",
            [product.name]
        );

        if (existingProduct.rows.length === 0) {
            await client.query(
                "INSERT INTO products (id, name, price, category, stock) VALUES ($1, $2, $3, $4, $5)",
                [product.id, product.name, product.price, product.category, product.stock]
            );
            console.log(`Created product: "${product.name}"`);
        } else {
            console.log(`Product "${product.name}" already exists, skipping.`);
        }
    }
    console.log("Product seeding finished.");
}