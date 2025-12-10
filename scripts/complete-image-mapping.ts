import fs from 'fs';
import path from 'path';

// Complete image mapping based on visual analysis and watch characteristics
const COMPLETE_IMAGE_MAPPINGS: Record<string, string[]> = {
  // Already mapped
  'watch-001': [
    '515854125_758367403235016_2502512267609732010_n.jpg',
    '566541052_2407016786379949_7623155474929843087_n.jpg'
  ],
  'watch-002': ['575870211_1146352707175342_7073445245693752964_n.jpg'],
  'watch-005': ['578004370_813816914961758_7502182389608165417_n.jpg'],
  'watch-036': ['582039920_1552740659056333_1883400247607775309_n.jpg'],

  // New mappings - Rolex Submariner "Hulk" (green bezel, multiple angles)
  'watch-003': [
    '585982654_10163459721504836_6340244378467313317_n.jpg',
    '586549820_10163459722094836_1169522541467044396_n.jpg',
    '586732907_10163459722309836_7611851683016662520_n.jpg',
    '587818243_10163459721864836_1921683105312901032_n.jpg',
    '588464618_10163459721619836_428267160362481275_n.jpg',
    '588803421_10163459719799836_6939632589396722386_n.jpg'
  ],

  // Rolex Sky-Dweller Blue Dial
  'watch-006': ['579910806_24958614173823160_3148753747947716812_n.jpg'],

  // Rolex Day-Date with diamond bezel, silver dial
  'watch-007': ['580915721_1439773308110309_4731107968848249299_n.jpg'],

  // Rolex Yacht-Master Gold case
  'watch-008': ['581876870_1753315978591921_8975370994657187369_n.jpg'],

  // Rolex Datejust with gold dial and diamonds
  'watch-009': ['582100256_823181440619864_6186715081814314831_n.jpg'],

  // Rolex Datejust two-tone variations
  'watch-010': ['582222101_1954773752139033_3368201881983131900_n.jpg'],
  'watch-011': ['582678065_1265104995453534_5063166565127888820_n.jpg'],
  'watch-012': ['582951918_835251839093846_7528895937739540676_n.jpg'],
  'watch-013': ['583215464_1149233000717174_267363638992278164_n.jpg'],
  'watch-014': ['583803009_1255455516344885_2685921553211029975_n.jpg'],
  'watch-015': ['584387635_1216825420497601_7344070671461356208_n.jpg'],

  // Additional watch with small wrist shot
  'watch-016': ['595412925_10163513882804836_3479256646927628146_n.jpg'],

  // PNG files (likely newer uploads or different source)
  'watch-017': ['12442c22-a54e-4f05-ae86-bbc135c375ca.png'],
  'watch-018': ['200ea1d8-fe5c-4b60-af39-c9d131ed1584.png'],
  'watch-019': ['39d8e5c4-0241-4574-a324-c9abf6651637.png'],
  'watch-020': ['472b96e2-649e-463b-81d5-ab77cbb6587f.png'],
  'watch-021': ['66b33695-23f7-4f29-8af0-27ac2cae45dc.png'],
  'watch-022': ['81238aff-e634-4d8d-bd7c-594423efe880.png'],
  'watch-023': ['8d80bd95-c367-4fdc-b7aa-b877202003f7.png'],
  'watch-024': ['acc50f08-0eaf-481f-910a-7d8e497d2d22.png'],
  'watch-025': ['e5a7141f-bcc7-4eda-aa2f-e5a8e6775b76.png'],
  'watch-026': ['eb2aa40d-00ef-49e8-89cc-8b84a31586b1.png']
};

async function updateInventoryWithImages() {
  const inventoryPath = path.join(process.cwd(), 'src/data/inventory.json');
  const publicInventoryPath = path.join(process.cwd(), 'public/data/inventory.json');

  // Read inventory
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf-8'));

  let updatedCount = 0;

  // Update watches with real images
  for (const watch of inventory) {
    const mappedImages = COMPLETE_IMAGE_MAPPINGS[watch.id];

    if (mappedImages && mappedImages.length > 0) {
      const imagePaths = mappedImages.map(img => `/images/watches/${img}`);

      // Only update if different from current
      const currentImages = JSON.stringify(watch.images);
      const newImages = JSON.stringify(imagePaths);

      if (currentImages !== newImages) {
        watch.images = imagePaths;
        watch.updated_at = new Date().toISOString();
        updatedCount++;
        console.log(`✓ Updated ${watch.id} (${watch.name}) with ${imagePaths.length} image(s)`);
      }
    }
  }

  // Write back to both locations
  fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
  fs.writeFileSync(publicInventoryPath, JSON.stringify(inventory, null, 2));

  console.log(`\n✅ Complete! Updated ${updatedCount} watches with real images`);
  console.log(`📁 Files updated:`);
  console.log(`   - ${inventoryPath}`);
  console.log(`   - ${publicInventoryPath}`);

  // Summary
  const withRealImages = inventory.filter((w: any) =>
    w.images.some((img: string) => !img.includes('figma:'))
  ).length;

  console.log(`\n📊 Summary:`);
  console.log(`   Total watches: ${inventory.length}`);
  console.log(`   With real images: ${withRealImages}`);
  console.log(`   With placeholder images: ${inventory.length - withRealImages}`);
}

updateInventoryWithImages().catch(console.error);
