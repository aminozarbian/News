const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Configuration
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'news-app';
const inputDir = 'mongo-export';

async function importData() {
  const client = new MongoClient(uri);

  try {
    if (!fs.existsSync(inputDir)) {
      throw new Error(`Directory "${inputDir}" not found. Please put the exported JSON files there.`);
    }

    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Read all .json files from the directory
    const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.json'));

    for (const file of files) {
      const collectionName = path.basename(file, '.json');
      console.log(`Importing collection: ${collectionName}`);
      
      const filePath = path.join(inputDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);

      if (data.length === 0) {
        console.log(`Skipping ${collectionName} (no data)`);
        continue;
      }

      // Handle specific types like Dates if necessary, but MongoDB driver usually handles ISO strings well
      // or we might need to transform _id back to ObjectId if they are strings.
      // However, for a simple migration, we'll try inserting as-is.
      // If _id conflict exists, we can use insertMany with ordered:false or delete first.
      
      // Option: Clear existing data before import? 
      // await db.collection(collectionName).deleteMany({}); 

      // Transform _id and dates back to proper objects if needed
      const transformedData = data.map(doc => {
          if (doc._id && typeof doc._id === 'string') {
              // Leave as string if your app uses strings, or convert to ObjectId
              // doc._id = new require('mongodb').ObjectId(doc._id);
          }
          // Simple date detection
          for (const key in doc) {
            if (typeof doc[key] === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(doc[key])) {
                 doc[key] = new Date(doc[key]);
            }
          }
          return doc;
      });

      try {
        await db.collection(collectionName).insertMany(transformedData);
        console.log(`Imported ${data.length} documents into ${collectionName}`);
      } catch (e) {
          if (e.code === 11000) {
              console.log(`Some documents in ${collectionName} already exist (skipping duplicates).`);
          } else {
              throw e;
          }
      }
    }
    
    console.log('Import completed successfully!');
  } catch (err) {
    console.error('Error during import:', err);
  } finally {
    await client.close();
  }
}

importData();

