require('dotenv').config();
const mongoose = require('mongoose');

const migrateNewsletterCollection = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get reference to the database
    const db = mongoose.connection.db;

    // Check if old collection exists
    const collections = await db.listCollections().toArray();
    const oldCollectionExists = collections.some(col => col.name === 'newsletters');

    if (!oldCollectionExists) {
      console.log('No "newsletters" collection found. No migration needed.');
      process.exit(0);
    }

    // Get all documents from old collection
    const oldSubscribers = await db.collection('newsletters').find({}).toArray();
    console.log(`Found ${oldSubscribers.length} subscribers in old collection`);

    if (oldSubscribers.length === 0) {
      console.log('No subscribers to migrate.');
      process.exit(0);
    }

    // Migrate each subscriber individually
    let migratedCount = 0;
    let updatedCount = 0;

    for (const subscriber of oldSubscribers) {
      // Remove _id from the subscriber data for upsert
      const { _id, ...subscriberData } = subscriber;
      
      const result = await db.collection('newsletter_subscribers').updateOne(
        { email: subscriber.email },
        { 
          $set: {
            ...subscriberData,
            migratedAt: new Date()
          }
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) migratedCount++;
      if (result.modifiedCount > 0) updatedCount++;
    }

    console.log(`Migration results:
    - New subscribers added: ${migratedCount}
    - Existing subscribers updated: ${updatedCount}
    - Total processed: ${oldSubscribers.length}`);

    // Verify migration
    const newCount = await db.collection('newsletter_subscribers').countDocuments();
    console.log(`New collection has ${newCount} total subscribers`);

    // Drop old collection
    await db.collection('newsletters').drop();
    console.log('Old collection dropped successfully');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

migrateNewsletterCollection(); 