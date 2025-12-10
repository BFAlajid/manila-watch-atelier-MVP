import fs from 'fs/promises';
import path from 'path';

// Based on visual analysis of images
const IMAGE_MAPPINGS = {
  // Rolex Datejust 31mm Two-Tone (watch-001) - champagne dial, Roman numerals
  'watch-001': [
    '515854125_758367403235016_2502512267609732010_n.jpg',
    '566541052_2407016786379949_7623155474929843087_n.jpg'
  ],

  // Rolex Datejust - White dial, Roman numerals (watch-002 or similar)
  'watch-002': [
    '575870211_1146352707175342_7073445245693752964_n.jpg'
  ],

  // Rolex Datejust - Gold champagne with diamonds (watch-005)
  'watch-005': [
    '578004370_813816914961758_7502182389608165417_n.jpg'
  ],

  // Rolex Sky-Dweller - Blue dial (watch-004 or new)
  'watch-sky-dweller-001': [
    '579910806_24958614173823160_3148753747947716812_n.jpg'
  ],

  // Rolex Day-Date - Diamond bezel, silver dial (watch-005 or new)
  'watch-day-date-001': [
    '580915721_1439773308110309_4731107968848249299_n.jpg'
  ],

  // Rolex Yacht-Master - Gold, blue dial
  'watch-yacht-master-001': [
    '581876870_1753315978591921_8975370994657187369_n.jpg'
  ],

  // Patek Philippe Nautilus - Grey dial with complications (watch-036)
  'watch-036': [
    '582039920_1552740659056333_1883400247607775309_n.jpg'
  ],

  // Rolex Datejust - Gold dial, Jubilee with diamonds
  'watch-datejust-gold-diamond': [
    '582100256_823181440619864_6186715081814314831_n.jpg'
  ],

  // Rolex Submariner "Hulk" - Green bezel (multiple angles)
  'watch-submariner-hulk': [
    '585982654_10163459721504836_6340244378467313317_n.jpg',
    '586549820_10163459722094836_1169522541467044396_n.jpg',
    '586732907_10163459722309836_7611851683016662520_n.jpg',
    '587818243_10163459721864836_1921683105312901032_n.jpg',
    '588464618_10163459721619836_428267160362481275_n.jpg',
    '588803421_10163459719799836_6939632589396722386_n.jpg',
    '595412925_10163513882804836_3479256646927628146_n.jpg'
  ],

  // Additional watches - need to assign to inventory
  'watch-misc-001': ['582222101_1954773752139033_3368201881983131900_n.jpg'],
  'watch-misc-002': ['582678065_1265104995453534_5063166565127888820_n.jpg'],
  'watch-misc-003': ['582951918_835251839093846_7528895937739540676_n.jpg'],
  'watch-misc-004': ['583215464_1149233000717174_267363638992278164_n.jpg'],
  'watch-misc-005': ['583803009_1255455516344885_2685921553211029975_n.jpg'],
  'watch-misc-006': ['584387635_1216825420497601_7344070671461356208_n.jpg'],

  // PNG files
  'watch-png-001': ['12442c22-a54e-4f05-ae86-bbc135c375ca.png'],
  'watch-png-002': ['200ea1d8-fe5c-4b60-af39-c9d131ed1584.png'],
  'watch-png-003': ['39d8e5c4-0241-4574-a324-c9abf6651637.png'],
  'watch-png-004': ['472b96e2-649e-463b-81d5-ab77cbb6587f.png'],
  'watch-png-005': ['66b33695-23f7-4f29-8af0-27ac2cae45dc.png'],
  'watch-png-006': ['81238aff-e634-4d8d-bd7c-594423efe880.png'],
  'watch-png-007': ['8d80bd95-c367-4fdc-b7aa-b877202003f7.png'],
  'watch-png-008': ['acc50f08-0eaf-481f-910a-7d8e497d2d22.png'],
  'watch-png-009': ['e5a7141f-bcc7-4eda-aa2f-e5a8e6775b76.png'],
  'watch-png-010': ['eb2aa40d-00ef-49e8-89cc-8b84a31586b1.png']
};

async function updateInventoryWithImages() {
  const inventoryPath = path.join(process.cwd(), 'src', 'data', 'inventory.json');
  const inventory = JSON.parse(await fs.readFile(inventoryPath, 'utf-8'));

  console.log('Updating inventory with real watch images...\n');

  for (const watch of inventory) {
    const mappedImages = IMAGE_MAPPINGS[watch.id as keyof typeof IMAGE_MAPPINGS];

    if (mappedImages) {
      watch.images = mappedImages.map(img => `/images/watches/${img}`);
      console.log(`✓ Updated ${watch.id}: ${watch.name}`);
      console.log(`  Images: ${mappedImages.length} photo(s)`);
    } else {
      console.log(`⚠ No mapping for ${watch.id}: ${watch.name} (keeping existing)`);
    }
  }

  await fs.writeFile(inventoryPath, JSON.stringify(inventory, null, 2));
  console.log('\n✅ Inventory updated successfully!');
}

updateInventoryWithImages().catch(console.error);
