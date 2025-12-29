import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('Setting up EFS database schema...');
    
    // Create collections if not exists
    const collections = [
      'users',
      'pending_accounts',
      'courses',
      'pending_courses',
      'group_requests',
      'group_invitations',
      'questionnaires',
      'materials',
      'user_timetables'
    ];
    
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (err) {
        if (err.codeName === 'NamespaceExists') {
          console.log(`ℹ️ Collection already exists: ${collectionName}`);
        }
      }
    }
    
    // Create indexes
    console.log('Creating indexes...');
    
    await db.collection('users').createIndexes([
      { key: { sid: 1 }, unique: true },
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } },
      { key: { createdAt: -1 } }
    ]);
    
    await db.collection('pending_accounts').createIndexes([
      { key: { sid: 1 }, unique: true },
      { key: { createdAt: -1 } }
    ]);
    
    await db.collection('courses').createIndexes([
      { key: { code: 1 }, unique: true },
      { key: { status: 1 } }
    ]);
    
    await db.collection('group_requests').createIndexes([
      { key: { sid: 1 } },
      { key: { major: 1 } },
      { key: { createdAt: -1 } }
    ]);
    
    await db.collection('questionnaires').createIndexes([
      { key: { creatorSid: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } }
    ]);
    
    await db.collection('materials').createIndexes([
      { key: { courseCode: 1 } },
      { key: { uploadedBy: 1 } },
      { key: { downloads: -1 } }
    ]);
    
    // Create admin user if not exists
    const adminExists = await db.collection('users').findOne({ role: 'admin' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const adminUser = {
        sid: 'admin001',
        email: 'admin@efs.com',
        password: hashedPassword,
        role: 'admin',
        credits: 999,
        createdAt: new Date(),
        updatedAt: new Date(),
        major: 'Administration',
        year_of_study: 1,
        about_me: 'System Administrator',
      };
      
      await db.collection('users').insertOne(adminUser);
      console.log('✅ Created default admin user: admin@efs.com / admin123');
    }
    
    console.log('✅ Database setup completed!');
    
  } catch (err) {
    console.error('❌ Database setup failed:', err);
  } finally {
    await client.close();
  }
}

setupDatabase();
