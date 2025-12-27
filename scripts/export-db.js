const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Configuration
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'news-app';
const outputDir = 'mongo-export';

async function exportData() {
  const client = new MongoClient(uri);

  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir);
    }

    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    
    for (const collectionInfo of collections) {
      const name = collectionInfo.name;
      console.log(`Exporting collection: ${name}`);
      
      const data = await db.collection(name).find({}).toArray();
      
      fs.writeFileSync(
        path.join(outputDir, `${name}.json`),
        JSON.stringify(data, null, 2)
      );
      console.log(`Saved ${data.length} documents to ${name}.json`);
    }
    
    console.log('Export completed successfully! You can now copy the "mongo-export" folder to your server.');
  } catch (err) {
    console.error('Error during export:', err);
  } finally {
    await client.close();
  }
}

exportData();

