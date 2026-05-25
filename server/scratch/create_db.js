import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Client } = pkg;

async function run() {
  console.log("Checking and creating database if not exists...");
  
  // Use connection string but connect to the default 'postgres' DB first
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:1234@localhost:5432/invertis_feedback";
  
  // Replace the target database name with 'postgres' to connect to default DB
  const defaultConnectionString = connectionString.replace(/\/invertis_feedback(\?|$)/, '/postgres$1');
  
  console.log(`Connecting to temporary DB: ${defaultConnectionString.replace(/:[^:]+@/, ':****@')}`);
  
  const client = new Client({
    connectionString: defaultConnectionString
  });
  
  try {
    await client.connect();
    
    // Check if the database already exists
    const checkRes = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'invertis_feedback'"
    );
    
    if (checkRes.rowCount === 0) {
      console.log("Database 'invertis_feedback' does not exist. Creating it...");
      // CREATE DATABASE cannot run inside a transaction block, so pg's Client is perfect
      await client.query("CREATE DATABASE invertis_feedback");
      console.log("Database 'invertis_feedback' created successfully!");
    } else {
      console.log("Database 'invertis_feedback' already exists. Skipping creation.");
    }
  } catch (err) {
    console.error("Error creating database:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
