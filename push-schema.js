import pg from 'pg';
const { Pool } = pg;

const main = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  console.log('Pushing schema changes to the database...');
  
  try {
    const result = await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        document_type TEXT NOT NULL CHECK (document_type IN ('lease_agreement', 'rental_application', 'notice_of_rent_increase', 'maintenance_request', 'property_inspection', 'eviction_notice', 'other')),
        template_id TEXT,
        content TEXT NOT NULL,
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        property_id INTEGER REFERENCES properties(id),
        lease_id INTEGER REFERENCES leases(id),
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signatures', 'completed', 'rejected', 'expired')),
        metadata JSONB,
        version INTEGER DEFAULT 1,
        expiration_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS signatures (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL REFERENCES documents(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        signature_image TEXT,
        signature_type TEXT NOT NULL CHECK (signature_type IN ('drawn', 'typed', 'uploaded')),
        signed_at TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'rejected', 'revoked')),
        signature_position JSONB,
        verification_token TEXT,
        verification_method TEXT NOT NULL DEFAULT 'email' CHECK (verification_method IN ('email', 'sms', 'none')),
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS document_templates (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        document_type TEXT NOT NULL CHECK (document_type IN ('lease_agreement', 'rental_application', 'notice_of_rent_increase', 'maintenance_request', 'property_inspection', 'eviction_notice', 'other')),
        content TEXT NOT NULL,
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        is_public BOOLEAN DEFAULT FALSE,
        is_official_template BOOLEAN DEFAULT FALSE,
        legal_jurisdiction TEXT DEFAULT 'Ontario',
        version INTEGER DEFAULT 1,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS document_audit_logs (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL REFERENCES documents(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        action TEXT NOT NULL CHECK (action IN ('created', 'viewed', 'edited', 'signed', 'sent', 'downloaded', 'rejected', 'deleted')),
        details JSONB,
        ip_address TEXT,
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    console.log('Schema changes successfully pushed to the database.');
  } catch (error) {
    console.error('Error pushing schema changes:', error);
  } finally {
    await pool.end();
  }
};

main().catch(console.error);