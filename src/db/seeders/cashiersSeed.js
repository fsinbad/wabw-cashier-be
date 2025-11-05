import bcrypt from "bcrypt";
import { randomUUID } from 'node:crypto';

const adminUser = {
    id: crypto.randomUUID(),
    username: "admin",
    email: "admin@test.com",
    plainPassword: "nioka666",
    role: "ADMIN",
};

export const seedAdminUser = async (client) => {
    console.log("Seeding admin user...");
    const hashedPassword = await bcrypt.hash(adminUser.plainPassword, 10);
    const existingUser = await client.query(
        "SELECT * FROM users WHERE email = $1",
        [adminUser.email]
    );

    if (existingUser.rows.length > 0) {
        await client.query(
            "UPDATE users SET password = $1, role = $2, username = $3 WHERE email = $4",
            [hashedPassword, adminUser.role, adminUser.username, adminUser.email]
        );
        console.log(`User "${adminUser.username}" updated.`);
    } else {
        await client.query(
            "INSERT INTO users (id, username, email, password, role) VALUES ($1, $2, $3, $4, $5)",
            [
                adminUser.id,
                adminUser.username,
                adminUser.email,
                hashedPassword,
                adminUser.role,
            ]
        );
        console.log(`User "${adminUser.username}" created.`);
    }
    console.log("Admin user seeding finished.");
}
