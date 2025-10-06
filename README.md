# Backend for Cashier web assignment

Developed using Hapi.js and PostgreSQL, this backend application is designed to run seamlessly in both Docker and local development environments. It also supports optional deployment using Supabase for cloud-based database management.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+ (for NPM scripts)
- [PostgreSQL](https://www.postgresql.org/) (latest recommended)  
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (latest recommended)  

## Installation

Clone this repo and set up your `.env` file. 
```bash
git clone https://github.com/niokagi/hapi-pgsql-boilerplate.git

cd hapi-pgsql-boilerplate

cp .env.example .env
```
## Environment Variables & Security (`dotenvx`)

This project uses [dotenvx](https://dotenvx.com) to manage environment variables securely and facilitate team collaboration. It allows for committing encrypted variables to the repository.

### Initial Setup (First time only)

**1. Generate a Key:**

Create a master encryption key. This will generate a `.env.key` file.
```bash
npx dotenvx gen-key
```
**1. Update 

`.gitignore`:** Ensure `.env` and `.env.key` are listed in your `.gitignore` file. These files should **never** be committed.
```gitignore
# environment variables
.env
.env.key
```

### Workflow

**1. Edit Variables:**

Make changes to your local, plain-text `.env` file as you normally would.

**2. Encrypt Variables:**

After editing, run the `encrypt` command. This will read your `.env` file and generate/update an encrypted `.env.vault / .env` file. This vault file is safe to commit to Git.
```bash
npx dotenvx encrypt
```

**3. Viewing/Decrypting Variables:** 

If you ever need to see the plain-text variables stored in the vault, you can decrypt them to your terminal (this requires the `.env.key` file to be present).
```bash
npx dotenvx decrypt
```

### How It Works with NPM Scripts

The `package.json` scripts (`start`, `dev`, `migrate`, `seed`) are already configured to use `dotenvx run --`. This command automatically decrypts the `.env.vault` in memory using your local `.env.key` and injects the variables into the node process, so you don't need to do anything extra.

## Run with a Local PostgreSQL Instance
This workflow is an alternative to Docker if you prefer to run Node.js and PostgreSQL directly on your host machine.

**1. Create and Migrate the Database**
**Create the Database Manually**
Before running migrations, you must create the database on your PostgreSQL server. Connect using `psql` or a GUI client (like DBeaver/pgAdmin) and run:
```sql
CREATE DATABASE "hapi-starter";
```
*Note: Ensure the name matches the `PGDATABASE` value in your `.env` file.*

**2. Run Migrations**
```bash
npm run migrate up
```
Migration commands:

| Command                  | Description                                |
| :----------------------- | :----------------------------------------- |
| `npm run migrate create <name>` | Create a new migration file.             |
| `npm run migrate up`     | Apply all pending migrations.              |
| `npm run migrate down`   | Revert the last applied migration.         |

**3. Run the Development Server**
```bash
npm run dev
```
The server will be running on `http://localhost:3000` by default.

## (Alternative) Run with a Cloud Database (Supabase)

This boilerplate is pre-configured to work seamlessly with a managed PostgreSQL provider like Supabase.

1.  **Create a Supabase Project**
    Go to [supabase.com](https://supabase.com), create a new project, and save your database password securely.

2.  **Get the Connection String (Connection Pooler Recommended)**

3.  **Update `.env` File**

4.  **Run Migrations & Start the Server**

## Dev Workflow with Docker

| Command                                           | Description                                  |
| ------------------------------------------------- | -------------------------------------------- |
| `docker-compose up --build -d`                   | Build and start all services.                |
| `docker-compose down`                            | Stop and remove project containers.          |
| `docker-compose logs -f app`                     | Stream application logs.                     |
| `npm run migrate create <name>`                  | Create a new migration file.                 |
| `docker-compose exec app npm run migrate up`     | Run all pending migrations.                  |
| `docker-compose exec db psql -U <user> -d <db>`  | Open PostgreSQL shell inside container.      |

*Note: Use `localhost` with `.env` credentials for GUI clients (e.g., DBeaver, TablePlus).*
