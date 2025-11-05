import { randomUUID } from 'node:crypto';


const productsDummy = [
    // Food (8)
    { id: `prod-${randomUUID()}`, name: 'Nasi Goreng Spesial', price: 35000, category: 'Food', stock: 50 },
    { id: `prod-${randomUUID()}`, name: 'Rendang Daging', price: 55000, category: 'Food', stock: 30 },
    { id: `prod-${randomUUID()}`, name: 'Sate Ayam', price: 28000, category: 'Food', stock: 60 },
    { id: `prod-${randomUUID()}`, name: 'Gado-Gado', price: 25000, category: 'Food', stock: 40 },
    { id: `prod-${randomUUID()}`, name: 'Soto Ayam Lamongan', price: 30000, category: 'Food', stock: 35 },
    { id: `prod-${randomUUID()}`, name: 'Rawon', price: 40000, category: 'Food', stock: 25 },
    { id: `prod-${randomUUID()}`, name: 'Ikan Bakar Jimbaran', price: 65000, category: 'Food', stock: 20 },
    { id: `prod-${randomUUID()}`, name: 'Ayam Penyet', price: 27000, category: 'Food', stock: 45 },
    // Beverage (4)
    { id: `prod-${randomUUID()}`, name: 'Es Teh Manis', price: 8000, category: 'Beverage', stock: 100 },
    { id: `prod-${randomUUID()}`, name: 'Es Jeruk', price: 12000, category: 'Beverage', stock: 80 },
    { id: `prod-${randomUUID()}`, name: 'Kopi Tubruk', price: 10000, category: 'Beverage', stock: 60 },
    { id: `prod-${randomUUID()}`, name: 'Wedang Jahe', price: 15000, category: 'Beverage', stock: 50 },
    // Dessert (3)
    { id: `prod-${randomUUID()}`, name: 'Es Pisang Ijo', price: 20000, category: 'Dessert', stock: 30 },
    { id: `prod-${randomUUID()}`, name: 'Martabak Manis Coklat Keju', price: 45000, category: 'Dessert', stock: 20 },
    { id: `prod-${randomUUID()}`, name: 'Dadar Gulung (3 pcs)', price: 18000, category: 'Dessert', stock: 40 },

    // Food (8)
    { id: `prod-${randomUUID()}`, name: 'Fish and Chips', price: 85000, category: 'Food', stock: 40 },
    { id: `prod-${randomUUID()}`, name: 'Shepherd\'s Pie', price: 95000, category: 'Food', stock: 25 },
    { id: `prod-${randomUUID()}`, name: 'Full English Breakfast', price: 110000, category: 'Food', stock: 20 },
    { id: `prod-${randomUUID()}`, name: 'Bangers and Mash', price: 75000, category: 'Food', stock: 30 },
    { id: `prod-${randomUUID()}`, name: 'Roast Beef (Sunday Roast)', price: 130000, category: 'Food', stock: 15 },
    { id: `prod-${randomUUID()}`, name: 'Beef Wellington (Slice)', price: 180000, category: 'Food', stock: 10 },
    { id: `prod-${randomUUID()}`, name: 'Steak and Kidney Pie', price: 90000, category: 'Food', stock: 20 },
    { id: `prod-${randomUUID()}`, name: 'Cornish Pasty', price: 45000, category: 'Food', stock: 35 },
    // Beverage (4)
    { id: `prod-${randomUUID()}`, name: 'English Breakfast Tea', price: 25000, category: 'Beverage', stock: 70 },
    { id: `prod-${randomUUID()}`, name: 'Pimm\'s Cup', price: 65000, category: 'Beverage', stock: 30 },
    { id: `prod-${randomUUID()}`, name: 'London Pride (Ale)', price: 70000, category: 'Beverage', stock: 25 },
    { id: `prod-${randomUUID()}`, name: 'Hot Chocolate', price: 35000, category: 'Beverage', stock: 50 },
    // Dessert (3)
    { id: `prod-${randomUUID()}`, name: 'Sticky Toffee Pudding', price: 55000, category: 'Dessert', stock: 20 },
    { id: `prod-${randomUUID()}`, name: 'Apple Crumble', price: 50000, category: 'Dessert', stock: 25 },
    { id: `prod-${randomUUID()}`, name: 'Eton Mess', price: 48000, category: 'Dessert', stock: 30 },
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