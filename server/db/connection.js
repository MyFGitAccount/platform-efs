import { MongoClient } from 'mongodb';

let client;
let db;

const connectDB = async () => {
  if (db) return db;
  /***
   * Note:Never exceed 25–30 on shared tiers — you'll hit 500 instantly with 20+ Vercel invocations
   * Do NOT stay on M0/M2/M5 for anything beyond demo/prototype
   * Upgrade to M10 or M20 as soon as we have real users.
   * It costs ~$9–12/month (or less with credits) and will save 
   *  weeks of debugging connection issues.
   * Trust me —if we tried to 
   * run on M0/M2 during add/drop period it will crashed immediately no doubt.
   * -----------------------------------------------------------------------------
   * M0
   * Maxpoolsize:10–15;
   * totalconnection:500;
   * for free tier M0 can't handle 100 concurrent user and 10–20 concurrent users are best for M0 
   * and for 50 concurrent users it is risky for M0 as it will add rate limiting therefore
   * 20 user is good for M0 
   * ---------------------------
   * M2
   * Maxpoolsize:15–25
   * totalconnection:500;
   * for M2 it can serve at most 50 users and 15–30 concurrent functions at best
   * and for 50  concurrent users it is fine but cann't handle 100 concurrent users same as M0
   * so best for 20-50 concurrent user
   */
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI, {
      // (100–500 concurrent users realistic target)
      maxPoolSize: 15,          
      minPoolSize: 5,          // keep some warm connections
      maxIdleTimeMS: 10000,     // close idle connections after 10s (saves Atlas costs)
      waitQueueTimeoutMS: 10000,// fail fast if no connection available
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      
      // very useful in serverless
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
  }

  db = client.db(); // or client.db('efs') if you want explicit name
  return db;
};

export default connectDB;