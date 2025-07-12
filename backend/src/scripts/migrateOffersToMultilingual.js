require('dotenv').config();
const mongoose = require('mongoose');
const Offer = require('../models/Offer');

const migrateOffersToMultilingual = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/retail_shop', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Find all offers
    const offers = await Offer.find({});
    console.log(`Found ${offers.length} offers to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const offer of offers) {
      // Check if the offer already has the new multilingual structure
      if (offer.title && typeof offer.title === 'object' && offer.title.pt && offer.title.en) {
        console.log(`Offer ${offer._id} already has multilingual structure, skipping...`);
        skippedCount++;
        continue;
      }

      // Check if the offer has the old structure (title as string)
      if (offer.title && typeof offer.title === 'string') {
        console.log(`Migrating offer ${offer._id}: "${offer.title}"`);
        
        // Convert to multilingual structure
        const updateData = {
          title: {
            pt: offer.title,
            en: offer.title
          },
          description: {
            pt: offer.description,
            en: offer.description
          }
        };

        await Offer.findByIdAndUpdate(offer._id, updateData);
        migratedCount++;
        console.log(`Successfully migrated offer ${offer._id}`);
      } 
      // Check if the offer has title/description as objects but not in proper multilingual structure
      else if (offer.title && typeof offer.title === 'object' && !offer.title.pt && !offer.title.en) {
        console.log(`Migrating offer ${offer._id}: "${offer.title}" (object structure)`);
        
        // Get the current title and description values
        const currentTitle = offer.title.toString ? offer.title.toString() : String(offer.title);
        const currentDescription = offer.description.toString ? offer.description.toString() : String(offer.description);
        
        // Convert to multilingual structure
        const updateData = {
          title: {
            pt: currentTitle,
            en: currentTitle
          },
          description: {
            pt: currentDescription,
            en: currentDescription
          }
        };

        await Offer.findByIdAndUpdate(offer._id, updateData);
        migratedCount++;
        console.log(`Successfully migrated offer ${offer._id}`);
      } else {
        console.log(`Offer ${offer._id} has unexpected structure, skipping...`);
        console.log(`Title type: ${typeof offer.title}, Title value:`, offer.title);
        skippedCount++;
      }
    }

    console.log(`\nMigration completed!`);
    console.log(`Migrated: ${migratedCount} offers`);
    console.log(`Skipped: ${skippedCount} offers`);

    process.exit(0);
  } catch (error) {
    console.error('Error migrating offers:', error);
    process.exit(1);
  }
};

migrateOffersToMultilingual(); 