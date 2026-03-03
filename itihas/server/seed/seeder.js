/**
 * Database seeder — Bangladesh Heritage Explorer (itihas)
 *
 * Usage:
 *   node server/seed/seeder.js          – seed admin user + heritage places
 *   node server/seed/seeder.js --clear  – remove all seeded data
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');
const Story = require('../models/Story');

// ─── Admin user ──────────────────────────────────────────────────

const adminUser = {
  name: 'Admin',
  email: 'admin@itihas.com',
  password: 'itihas2024',
  role: 'admin',
  avatar:
    'https://ui-avatars.com/api/?background=1a5632&color=f5f0e8&name=Admin',
};

// ─── Heritage places ─────────────────────────────────────────────

const places = [
  // ── 1. Mosque City of Bagerhat (Shat Gombuj Mosque) ──────────────
  {
    name: { en: 'Mosque City of Bagerhat', bn: 'বাগেরহাটের মসজিদ শহর' },
    slug: 'mosque-city-of-bagerhat',
    subtitle: 'The Sixty Dome Mosque & the legacy of Khan Jahan Ali',
    description: {
      short:
        'A UNESCO World Heritage Site in Khulna division, the 15th-century mosque city was founded by the Muslim saint Khan Jahan Ali.',
      full:
        'The Mosque City of Bagerhat, known locally as Khalifatabad, is an outstanding example of an early Muslim city in the Bengal delta. Founded in the 15th century by the Turkish general-turned-saint Ulugh Khan Jahan, the city contains a remarkable collection of early Muslim monuments including mosques, mausoleums, bridges, roads and water tanks. The Shat Gombuj Mosque (Sixty Dome Mosque) is the largest ancient mosque in Bangladesh and one of the finest examples of pre-Mughal Muslim architecture in the Indian subcontinent.',
    },
    story: [
      {
        chapter: 1,
        title: 'The Arrival of Khan Jahan Ali',
        content:
          'In the early 15th century, a powerful Turkish general named Ulugh Khan Jahan arrived in the Sundarbans delta at the head of a large army. Renouncing military conquest, he chose instead to clear the dense jungle and build a city dedicated to the glory of Islam and the welfare of his people. He brought artisans, scholars, and labourers, transforming a wilderness into a planned urban settlement that would later bear the name Khalifatabad.',
        year: 'c. 1420 AD',
        era: 'Sultanate (1200-1576)',
      },
      {
        chapter: 2,
        title: 'Building the Sixty Dome Mosque',
        content:
          'The crowning achievement of Khan Jahan Ali was the construction of the Shat Gombuj Mosque — literally the "Sixty Dome Mosque," though it actually bears 77 domes. Built using locally fired terracotta bricks, the mosque measures 160 feet by 108 feet. Sixty stone pillars divide its interior into seven aisles, creating a forest of columns bathed in soft light from 26 arched doorways. The craftsmanship reflects the confluence of Bengali, Turkish, and Central Asian architectural traditions.',
        year: 'c. 1459 AD',
        era: 'Sultanate (1200-1576)',
      },
      {
        chapter: 3,
        title: 'The Saint and His Legacy',
        content:
          'Khan Jahan Ali was venerated both as an administrator and as a Sufi saint. He constructed tanks, roads, and bridges to serve the local population, many of which survive today. His mausoleum in Bagerhat became a pilgrimage site for Hindus and Muslims alike, a testament to his inclusive vision. The crocodiles in the adjacent tank are believed by locals to be sacred descendants of those the saint kept as pets.',
        year: 'c. 1459 AD',
        era: 'Sultanate (1200-1576)',
      },
    ],
    historicalSignificance: 'UNESCO World Heritage',
    era: ['Sultanate (1200-1576)'],
    category: 'UNESCO',
    location: {
      type: 'Point',
      coordinates: [89.7506, 22.6602],
      address: 'Bagerhat Sadar, Bagerhat',
      division: 'Khulna',
      district: 'Bagerhat',
    },
    coverImage:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Sixty_Dome_Mosque_2.jpg/1280px-Sixty_Dome_Mosque_2.jpg',
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Sixty_Dome_Mosque_2.jpg/1280px-Sixty_Dome_Mosque_2.jpg',
        caption: 'The Sixty Dome Mosque, Bagerhat',
        credit: 'Wikimedia Commons',
      },
    ],
    facts: [
      {
        title: 'UNESCO World Heritage Site',
        content: 'Inscribed on the UNESCO World Heritage List in 1985.',
        icon: 'award',
      },
      {
        title: 'Largest Ancient Mosque',
        content: 'The Shat Gombuj Mosque is the largest ancient mosque in Bangladesh.',
        icon: 'mosque',
      },
    ],
    timeline: [
      { year: 'c. 1420', event: 'Khan Jahan Ali arrives in the Sundarbans delta' },
      { year: 'c. 1459', event: 'Construction of the Shat Gombuj Mosque completed' },
      { year: '1985', event: 'Designated a UNESCO World Heritage Site' },
    ],
    practicalInfo: {
      openingHours: 'Open daily, dawn to dusk',
      entryFee: { local: 'BDT 20', foreign: 'USD 5' },
      bestTimeToVisit: 'October to March (cool, dry season)',
      howToReach:
        'Bus from Khulna (2 hours) or direct bus from Dhaka. Auto-rickshaw from Bagerhat town.',
    },
    heritageScore: 98,
    tags: ['UNESCO', 'mosque', 'medieval', 'Khan Jahan Ali', 'Sundarbans', 'Bagerhat'],
    featured: true,
    published: true,
  },

  // ── 2. Ruins of the Buddhist Vihara at Paharpur ──────────────────
  {
    name: { en: 'Ruins of the Buddhist Vihara at Paharpur', bn: 'পাহাড়পুর বৌদ্ধ বিহার' },
    slug: 'paharpur-buddhist-vihara',
    subtitle: 'The greatest Buddhist monastery south of the Himalayas',
    description: {
      short:
        'A UNESCO World Heritage Site in Rajshahi division, Paharpur is the remains of the great Somapura Mahavihara, one of the most important centres of Buddhist learning in medieval Asia.',
      full:
        'The Somapura Mahavihara, or Great Monastery of Paharpur, was built in the 8th century by the second Pala king, Dharmapala. For over 400 years it was a renowned intellectual and spiritual centre for Buddhism across Asia. Archaeologists have uncovered a vast monastic complex — the main stupa surrounded by 177 cells, extensive terracotta plaques, sculpture, coins, and inscriptions. Its architectural style influenced Buddhist temple design throughout Southeast Asia.',
    },
    story: [
      {
        chapter: 1,
        title: 'The Pala Empire and Buddhist Patronage',
        content:
          'The 8th century saw the rise of the Pala dynasty in Bengal, whose kings were fervent patrons of Buddhism. King Dharmapala, who ruled from approximately 770 to 810 AD, commissioned the construction of the Somapura Mahavihara as a gift to the Buddhist community. The scale of the project was extraordinary — thousands of workers laboured for decades to raise the massive cruciform main temple surrounded by 177 monastic cells arranged in a great quadrangle.',
        year: 'c. 781 AD',
        era: 'Ancient (pre-1200)',
      },
      {
        chapter: 2,
        title: 'A University in Stone',
        content:
          'At its height, the Somapura Mahavihara functioned as a residential university where monks from China, Tibet, Burma, Java, and Ceylon gathered to study philosophy, logic, grammar, and the Buddhist scriptures. Its library was renowned throughout Asia. The monastery was also a vibrant centre of art; thousands of terracotta plaques adorned its walls, depicting divinities, animals, and scenes from everyday life with extraordinary virtuosity.',
        year: '9th–11th century AD',
        era: 'Ancient (pre-1200)',
      },
      {
        chapter: 3,
        title: 'Destruction and Rediscovery',
        content:
          'By the 12th century the monastery had fallen into decline. The Palas weakened and, during a period of Hindu resurgence under the Sena dynasty, patronage of Buddhism dwindled. An attack — possibly by the armies of Bakhtiyar Khilji around 1200 AD — may have delivered the final blow. The great complex gradually disappeared under centuries of cultivation, until 1879 when the Archaeological Survey of India began excavations, slowly revealing one of Asia\'s most magnificent monastic complexes.',
        year: 'c. 1200 AD',
        era: 'Sultanate (1200-1576)',
      },
    ],
    historicalSignificance: 'UNESCO World Heritage',
    era: ['Ancient (pre-1200)'],
    category: 'UNESCO',
    location: {
      type: 'Point',
      coordinates: [88.9829, 25.0308],
      address: 'Paharpur, Badalgachhi Upazila, Naogaon',
      division: 'Rajshahi',
      district: 'Naogaon',
    },
    coverImage:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Somapura_Mahavihara_Ruins%2C_Rajshahi.jpg/1280px-Somapura_Mahavihara_Ruins%2C_Rajshahi.jpg',
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Somapura_Mahavihara_Ruins%2C_Rajshahi.jpg/1280px-Somapura_Mahavihara_Ruins%2C_Rajshahi.jpg',
        caption: 'Aerial view of Paharpur ruins',
        credit: 'Wikimedia Commons',
      },
    ],
    facts: [
      {
        title: 'UNESCO World Heritage Site',
        content: 'Inscribed in 1985 — one of the most important archaeological sites in South Asia.',
        icon: 'award',
      },
      {
        title: '177 Monastic Cells',
        content: 'The monastery contained 177 individual monks\' cells arranged around a central courtyard.',
        icon: 'building',
      },
    ],
    timeline: [
      { year: 'c. 781', event: 'Founded by Pala king Dharmapala' },
      { year: '9th–11th c.', event: 'Peak period; an international centre of Buddhist learning' },
      { year: 'c. 1200', event: 'Abandonment following attacks and decline of Pala patronage' },
      { year: '1985', event: 'Inscribed as UNESCO World Heritage Site' },
    ],
    practicalInfo: {
      openingHours: 'Sat–Thu 9 AM–5 PM',
      entryFee: { local: 'BDT 20', foreign: 'USD 5' },
      bestTimeToVisit: 'November to February',
      howToReach: 'Bus from Rajshahi (2.5 hrs) or Dhaka (6 hrs) to Badalgachhi/Paharpur crossroads.',
    },
    heritageScore: 97,
    tags: ['UNESCO', 'Buddhist', 'Pala', 'archaeology', 'monastery', 'Rajshahi'],
    featured: true,
    published: true,
  },

  // ── 3. Lalbagh Fort ──────────────────────────────────────────────
  {
    name: { en: 'Lalbagh Fort', bn: 'লালবাগ কেল্লা' },
    slug: 'lalbagh-fort',
    subtitle: 'An unfinished Mughal fortress with a haunting legend',
    description: {
      short:
        'An 17th-century Mughal fort in old Dhaka, commissioned by Prince Muhammad Azam and associated with the tragic death of Bibi Pari.',
      full:
        'Lalbagh Fort (Fort Aurangabad) is an incomplete 17th-century Mughal fort complex standing on the banks of the Buriganga River in Dhaka. Construction began in 1678 under the orders of Mughal Prince Muhammad Azam, son of Aurangzeb. After the death of Shaista Khan\'s beloved daughter Bibi Pari within the fort, Khan considered it ill-omened and halted construction. The three main structures that survive — the Mosque of Shaista Khan, the Tomb of Bibi Pari, and the audience hall — represent some of the finest Mughal architecture in Bangladesh.',
    },
    story: [
      {
        chapter: 1,
        title: 'Prince Azam Begins the Fort',
        content:
          'In 1678, the young Mughal Prince Muhammad Azam, son of Emperor Aurangzeb, was appointed Governor of Bengal. Energetic and ambitious, he ordered the construction of a grand fort on the banks of the Buriganga in Dhaka, the provincial capital. The project was grand in scope: a central mosque, an audience hall, and a residence for the governor, all enclosed by massive walls with bastions. But Azam was recalled to the Deccan after just fifteen months, leaving the fort unfinished.',
        year: '1678 AD',
        era: 'Mughal (1576-1757)',
      },
      {
        chapter: 2,
        title: 'The Death of Bibi Pari',
        content:
          'Shaista Khan, Dhaka\'s most celebrated Mughal governor, took over the incomplete fort and continued construction. But tragedy struck when his beloved daughter, Bibi Pari — whose name means "Fairy Lady" — died within the fort walls in 1684. Grief-stricken, Shaista Khan buried her in a magnificent marble-clad mausoleum within the fort compound. He then declared the fort cursed and ordered construction halted permanently, abandoning the ambitious project.',
        year: '1684 AD',
        era: 'Mughal (1576-1757)',
      },
      {
        chapter: 3,
        title: 'A Monument to Loss',
        content:
          'The Tomb of Bibi Pari is the finest of the surviving structures — a three-domed building faced with white marble imported from Rajasthan and black basalt from the Deccan. The interior was once adorned with Dutch tiles and coloured glass. Standing alone in the fort courtyard, it remains one of the most beautiful monuments to personal grief in Bangladesh, a father\'s eternal tribute to a lost daughter. Today the fort attracts hundreds of thousands of visitors each year who come to walk its grounds and contemplate its incomplete grandeur.',
        year: '17th century',
        era: 'Mughal (1576-1757)',
      },
    ],
    historicalSignificance: 'National Heritage',
    era: ['Mughal (1576-1757)'],
    category: 'Architectural',
    location: {
      type: 'Point',
      coordinates: [90.3873, 23.7198],
      address: 'Lalbagh, Dhaka',
      division: 'Dhaka',
      district: 'Dhaka',
    },
    coverImage:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Lalbag_Fort_Dhaka.JPG/1280px-Lalbag_Fort_Dhaka.JPG',
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Lalbag_Fort_Dhaka.JPG/1280px-Lalbag_Fort_Dhaka.JPG',
        caption: 'Lalbagh Fort, Dhaka',
        credit: 'Wikimedia Commons',
      },
    ],
    facts: [
      {
        title: 'Never Completed',
        content:
          'Construction was halted after the death of Bibi Pari and was never resumed despite spanning two governorships.',
        icon: 'alert',
      },
      {
        title: 'Marble from Rajasthan',
        content: 'The Tomb of Bibi Pari is faced in white marble imported from Rajasthan, rare in Bengal.',
        icon: 'gem',
      },
    ],
    timeline: [
      { year: '1678', event: 'Prince Muhammad Azam begins construction' },
      { year: '1680', event: 'Azam recalled; Shaista Khan resumes work' },
      { year: '1684', event: 'Bibi Pari dies; construction abandoned' },
      { year: '1971', event: 'Used as a base during the Liberation War' },
    ],
    practicalInfo: {
      openingHours: 'Sat–Wed 10 AM–5 PM, Thu 10 AM–12 PM, Fri closed',
      entryFee: { local: 'BDT 20', foreign: 'USD 5' },
      bestTimeToVisit: 'Year-round; avoid monsoon season',
      howToReach: 'Rickshaw or CNG auto-rickshaw from Sadarghat or Gulistan; 15–20 min from central Dhaka.',
    },
    heritageScore: 92,
    tags: ['Mughal', 'fort', 'Dhaka', 'Bibi Pari', 'Shaista Khan', 'architecture'],
    featured: true,
    published: true,
  },

  // ── 4. National Martyrs' Memorial (Jatiyo Smritisoudho) ──────────
  {
    name: { en: "National Martyrs' Memorial", bn: 'জাতীয় স্মৃতিসৌধ' },
    slug: 'national-martyrs-memorial',
    subtitle: 'A soaring tribute to the heroes of Bangladesh\'s Liberation War',
    description: {
      short:
        'Located at Savar near Dhaka, the National Martyrs\' Memorial is Bangladesh\'s premier monument commemorating the martyrs of the 1971 Liberation War.',
      full:
        'The National Martyrs\' Memorial (Jatiyo Smritisoudho) stands in Savar, 35 kilometres north of Dhaka. Designed by architect Syed Mainul Hossain, its seven triangular pillars represent the seven phases of the liberation struggle and rise to a height of 45.72 metres. The complex contains a mass grave of martyrs and a lake, all set within manicured gardens. It is the foremost national monument of Bangladesh, visited each year by millions on Independence Day and Victory Day.',
    },
    story: [
      {
        chapter: 1,
        title: 'The Sacrifice of 1971',
        content:
          'On 25 March 1971, Pakistani military forces launched Operation Searchlight — a brutal crackdown on the Bengali population of East Pakistan. Over the following nine months of war, between 300,000 and three million Bangladeshis were killed, and millions more were displaced. The Liberation War (Muktijuddho) saw ordinary Bangladeshis — students, farmers, intellectuals, freedom fighters — lay down their lives for the dream of an independent nation. When Bangladesh finally emerged victorious on 16 December 1971, the nation vowed to honour its martyrs with an enduring memorial.',
        year: '1971',
        era: 'Liberation War (1971)',
      },
      {
        chapter: 2,
        title: 'The Architecture of Grief and Hope',
        content:
          'The government held a competition for the memorial\'s design. Architect Syed Mainul Hossain\'s winning concept was inspired by the image of a mother cradling her slain son. Seven interlocking triangular concrete fins rise dramatically from a reflecting pool, symbolising the seven phases of the independence movement: the Language Movement (1952), the Autonomous Government Movement (1954), the Education Movement (1962), the Six-Point Movement (1966), the Mass Uprising (1969), the election of 1970, and the Liberation War (1971).',
        year: '1972–1982',
        era: 'Modern Bangladesh',
      },
      {
        chapter: 3,
        title: 'A Nation\'s Gathering Place',
        content:
          'Inaugurated on 16 December 1982, the memorial has become the emotional centre of Bangladeshi national identity. Every year on Victory Day (16 December) and Independence Day (26 March), the President and Prime Minister lead the nation in paying floral tributes here. The ground at the base of the monument contains the graves of martyrs — their presence giving the soaring concrete fins their full meaning. For every Bangladeshi, the memorial is both a place of mourning and a celebration of resilience.',
        year: '1982–present',
        era: 'Modern Bangladesh',
      },
    ],
    historicalSignificance: 'National Heritage',
    era: ['Liberation War (1971)', 'Modern Bangladesh'],
    category: 'Liberation War',
    location: {
      type: 'Point',
      coordinates: [90.2618, 23.9019],
      address: 'Nabi Nagar, Savar, Dhaka',
      division: 'Dhaka',
      district: 'Dhaka',
    },
    coverImage:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Jatiyo_Smriti_Soudho.jpg/1280px-Jatiyo_Smriti_Soudho.jpg',
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Jatiyo_Smriti_Soudho.jpg/1280px-Jatiyo_Smriti_Soudho.jpg',
        caption: 'National Martyrs\' Memorial, Savar',
        credit: 'Wikimedia Commons',
      },
    ],
    facts: [
      {
        title: '45.72 Metres Tall',
        content: 'The seven fins rise to 45.72 metres, making the memorial visible from a great distance.',
        icon: 'ruler',
      },
      {
        title: 'Seven Fins, Seven Phases',
        content: 'Each of the seven triangular fins represents a phase of Bangladesh\'s independence movement.',
        icon: 'star',
      },
    ],
    timeline: [
      { year: '1971', event: 'Liberation War; millions sacrificed for Bangladesh\'s independence' },
      { year: '1972', event: 'Construction of the memorial begins' },
      { year: '1982', event: 'Inaugurated on 16 December (Victory Day)' },
    ],
    practicalInfo: {
      openingHours: 'Open daily 9 AM–6 PM',
      entryFee: { local: 'Free', foreign: 'Free' },
      bestTimeToVisit: 'Year-round; most atmospheric on Victory Day (16 Dec) and Independence Day (26 Mar)',
      howToReach: 'Bus from Dhaka Gabtoli terminal to Savar (~45 min), then CNG to Smritisoudho.',
    },
    heritageScore: 99,
    tags: ['Liberation War', 'memorial', 'national monument', 'Savar', '1971', 'independence'],
    featured: true,
    published: true,
  },

  // ── 5. Mahasthangarh ─────────────────────────────────────────────
  {
    name: { en: 'Mahasthangarh', bn: 'মহাস্থানগড়' },
    slug: 'mahasthangarh',
    subtitle: 'The oldest known urban archaeological site in Bangladesh',
    description: {
      short:
        'Located near Bogura in Rajshahi division, Mahasthangarh is the oldest known urban settlement in Bangladesh, with occupation stretching from at least the 3rd century BC.',
      full:
        'Mahasthangarh (ancient Pundranagara) is a large and well-preserved archaeological site on the west bank of the Karatoa River near Bogura. It was the ancient capital of the Pundra Kingdom and later a major city of the Maurya, Gupta, Pala, and Sena empires. The site contains a massive mudbrick citadel measuring 1,525 × 1,370 metres, remains of temples, viharas, and mosques from successive civilisations, and a celebrated Brahmi inscription on stone that is one of the oldest in Bangladesh.',
    },
    story: [
      {
        chapter: 1,
        title: 'City of the Pundra Kingdom',
        content:
          'More than 2,300 years ago, the city of Pundranagara (modern Mahasthangarh) flourished on the banks of the Karatoa River in northwestern Bengal. It was the capital of the Pundra Kingdom — a powerful state mentioned in the ancient Indian texts as a centre of trade and culture. The great Mauryan emperor Ashoka sent his officials here; a fragmentary Brahmi inscription found at the site likely dates to the 3rd century BC and records an administrative order granting relief during a famine.',
        year: '3rd century BC',
        era: 'Ancient (pre-1200)',
      },
      {
        chapter: 2,
        title: 'Empires Rise and Fall',
        content:
          'Over the following 1,500 years, Mahasthangarh passed through the hands of a succession of great empires: the Mauryas, the Guptas, and then the Buddhist Pala dynasty, who made all of Bengal a centre of Buddhist learning and art. Later, the Hindu Sena dynasty ruled here before the arrival of Muslim armies at the turn of the 13th century. Each civilisation left its mark in the earth — temples, votive stupas, terracotta figurines, coins, and pottery shards that archaeologists continue to unearth today.',
        year: '3rd c. BC–12th c. AD',
        era: 'Ancient (pre-1200)',
      },
      {
        chapter: 3,
        title: 'Legends and Sacred Sites',
        content:
          'The site is associated with rich folklore. Gokul Med (the local name for a great Buddhist votive stupa) is said locally to have been built by the Jinn in a single night. Nearby, the Shrine of Shah Sultan Mahisawar — a revered Muslim saint said to have arrived on the back of a fish — attracts thousands of devotees each year. The landscape of Mahasthangarh is a palimpsest of 2,500 years of continuous religious practice, with Hindu ghats, Buddhist stupas, and Muslim dargahs sitting side by side.',
        year: 'Medieval period',
        era: 'Sultanate (1200-1576)',
      },
    ],
    historicalSignificance: 'National Heritage',
    era: ['Ancient (pre-1200)', 'Sultanate (1200-1576)'],
    category: 'Archaeological',
    location: {
      type: 'Point',
      coordinates: [89.3715, 24.9741],
      address: 'Mahasthan, Shibganj Upazila, Bogura',
      division: 'Rajshahi',
      district: 'Bogura',
    },
    coverImage:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mahasthangarh.jpg/1280px-Mahasthangarh.jpg',
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mahasthangarh.jpg/1280px-Mahasthangarh.jpg',
        caption: 'Archaeological remains at Mahasthangarh',
        credit: 'Wikimedia Commons',
      },
    ],
    facts: [
      {
        title: 'Oldest Urban Site',
        content: 'Mahasthangarh is the oldest known urban archaeological site in Bangladesh, dating to at least the 3rd century BC.',
        icon: 'calendar',
      },
      {
        title: 'Ancient Brahmi Inscription',
        content: 'A stone bearing a Brahmi inscription dating to the 3rd century BC is preserved in the site museum.',
        icon: 'scroll',
      },
    ],
    timeline: [
      { year: '3rd c. BC', event: 'City of Pundranagara established; Mauryan-era Brahmi inscription' },
      { year: '4th–6th c. AD', event: 'Prosperity under the Gupta Empire' },
      { year: '8th–11th c. AD', event: 'Buddhist Pala dynasty rules; great viharas constructed' },
      { year: '1879', event: 'Archaeological excavations begin' },
    ],
    practicalInfo: {
      openingHours: 'Sat–Thu 9 AM–5 PM',
      entryFee: { local: 'BDT 20', foreign: 'USD 5' },
      bestTimeToVisit: 'November to February',
      howToReach: 'Bus from Bogura town (~13 km north). Bogura is well-connected by bus and train from Dhaka.',
    },
    heritageScore: 94,
    tags: ['archaeology', 'ancient', 'Pundra', 'Maurya', 'Pala', 'Bogura', 'Rajshahi'],
    featured: true,
    published: true,
  },

  // ── 6. Sundarbans ────────────────────────────────────────────────
  {
    name: { en: 'The Sundarbans', bn: 'সুন্দরবন' },
    slug: 'the-sundarbans',
    subtitle: 'The world\'s largest mangrove forest — home of the Royal Bengal Tiger',
    description: {
      short:
        'Spanning the southern coastlines of Bangladesh and India, the Sundarbans is the world\'s largest tidal halophytic mangrove forest and a UNESCO World Heritage Site.',
      full:
        'The Sundarbans — literally "Beautiful Forest" — is the world\'s largest single block of tidal mangrove forest, shared between Bangladesh (about 60%) and India (about 40%). The Bangladeshi portion alone covers over 6,000 square kilometres and is home to the iconic Royal Bengal Tiger, Irrawaddy dolphins, saltwater crocodiles, and hundreds of bird species. The forest protects the coastline from cyclones and tsunamis and supports the livelihoods of millions of people in the surrounding region.',
    },
    story: [
      {
        chapter: 1,
        title: 'The Forest at the Edge of the World',
        content:
          'For thousands of years the Sundarbans was considered a wilderness at the edge of the known world — a maze of tidal rivers, creeks, and islands perpetually shaped and reshaped by the Ganges-Brahmaputra delta. Ancient sailors knew its treacherous tides; medieval poets celebrated its tigers; fishermen and honey-collectors entered it with prayers and trepidation. The forest was too wild for permanent settlement, yet it supported an extraordinary web of life found nowhere else on Earth.',
        year: 'Ancient to Medieval',
        era: 'Ancient (pre-1200)',
      },
      {
        chapter: 2,
        title: 'The Royal Bengal Tiger',
        content:
          'The Royal Bengal Tiger (Panthera tigris tigris) of the Sundarbans is unique among tigers for its ability to swim in salt water and its tolerance of tidal conditions. Local tradition holds that Banbibi, a forest deity worshipped by both Hindus and Muslims, protects honey-collectors and woodcutters who enter the forest. The tiger, though feared, is also respected as a manifestation of the forest\'s power. Conservation efforts have stabilised tiger numbers at roughly 100–150 individuals in Bangladesh alone.',
        year: 'Ongoing',
        era: 'Modern Bangladesh',
      },
      {
        chapter: 3,
        title: 'Climate Sentinel',
        content:
          'The Sundarbans faces existential threats from climate change. Sea levels are rising, fresh water flows are declining, and the salinity of the forest is increasing — stressing the vegetation that the entire ecosystem depends upon. Cyclones of increasing ferocity batter the coast, yet the mangrove belt absorbs their fury before it reaches the millions of people living in the coastal districts. The Sundarbans is simultaneously one of the world\'s most biodiverse ecosystems and one of its most vulnerable.',
        year: '21st century',
        era: 'Modern Bangladesh',
      },
    ],
    historicalSignificance: 'UNESCO World Heritage',
    era: ['Ancient (pre-1200)', 'Modern Bangladesh'],
    category: 'Natural',
    location: {
      type: 'Point',
      coordinates: [89.5792, 21.9497],
      address: 'Khulna and Satkhira districts, Khulna division',
      division: 'Khulna',
      district: 'Khulna',
    },
    coverImage:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Sundarbans_tiger.jpg/1280px-Sundarbans_tiger.jpg',
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Sundarbans_tiger.jpg/1280px-Sundarbans_tiger.jpg',
        caption: 'Royal Bengal Tiger in the Sundarbans',
        credit: 'Wikimedia Commons',
      },
    ],
    facts: [
      {
        title: 'UNESCO World Heritage Site',
        content: 'The Bangladeshi part of the Sundarbans was inscribed as a UNESCO World Heritage Site in 1997.',
        icon: 'award',
      },
      {
        title: 'Home of the Royal Bengal Tiger',
        content: 'The Sundarbans harbours one of the world\'s largest populations of the Bengal tiger.',
        icon: 'paw',
      },
    ],
    timeline: [
      { year: '1878', event: 'Forest Department takes over management of the Sundarbans' },
      { year: '1966', event: 'Declared a Wildlife Sanctuary' },
      { year: '1997', event: 'Inscribed as UNESCO World Heritage Site' },
    ],
    practicalInfo: {
      openingHours: 'Tourist season October to March',
      entryFee: { local: 'BDT 300 (permit)', foreign: 'USD 10 (permit)' },
      bestTimeToVisit: 'December to February (cool and dry)',
      howToReach: 'By boat from Mongla or Khulna. Guided tours available from both cities.',
    },
    heritageScore: 99,
    tags: ['UNESCO', 'mangrove', 'tiger', 'wildlife', 'Khulna', 'natural wonder', 'Sundarbans'],
    featured: true,
    published: true,
  },

  // ── 7. Ahsan Manzil ──────────────────────────────────────────────
  {
    name: { en: 'Ahsan Manzil', bn: 'আহসান মঞ্জিল' },
    slug: 'ahsan-manzil',
    subtitle: 'The Pink Palace — former residence of the Nawabs of Dhaka',
    description: {
      short:
        'The magnificent Pink Palace on the Buriganga riverfront in old Dhaka was the official residential palace of the Nawabs of Dhaka and is now a museum.',
      full:
        'Ahsan Manzil, popularly known as the Pink Palace, stands on the Kumartoli bank of the Buriganga River in Old Dhaka. It was the official residence of the Nawab of Dhaka and served as the centre of social and cultural life in the city during the colonial era. Built in 1872 in an Indo-Saracenic architectural style, the palace features a grand central dome visible from the river, ornate halls, and a sweeping garden. Today it is a museum housing furniture, portraits, and artefacts that recall the grandeur of Dhaka\'s Nawabi period.',
    },
    story: [
      {
        chapter: 1,
        title: 'The Rise of the Nawabs of Dhaka',
        content:
          'In the late 18th century, a prosperous merchant family from Kashmir settled in Dhaka and gradually rose to wealth and influence under British patronage. The family, led by Khwaja Alimullah, were granted the title of Nawab by the British and became the most powerful family in Dhaka, wielding enormous influence in trade, politics, and philanthropy. Their riverside palace, Ahsan Manzil, would become one of the most recognisable buildings in Bengal.',
        year: 'Late 18th century',
        era: 'Colonial (1757-1947)',
      },
      {
        chapter: 2,
        title: 'Building the Pink Palace',
        content:
          'The palace was named Ahsan Manzil — "Beautiful Mansion" — by Nawab Abdul Ghani in honour of his son Ahsanullah. Completed in 1872, the building combined European Baroque elements with Indian Mughal aesthetics in the Indo-Saracenic style popular in the British colonial period. A great hemispherical dome crowns the central block; broad verandahs and ornate plasterwork adorn the façade. The interior featured English furniture, Belgian mirrors, French chandeliers, and Persian carpets.',
        year: '1872',
        era: 'Colonial (1757-1947)',
      },
      {
        chapter: 3,
        title: 'The Partition Meeting and After',
        content:
          'In 1906, Ahsan Manzil hosted one of the most consequential meetings in South Asian history: Nawab Salimullah of Dhaka convened the founding meeting of the All India Muslim League in the palace gardens. The League would eventually lead the movement for Pakistan. After Partition in 1947, the Nawabs\' era faded; the palace fell into disrepair until the Bangladesh government took it over, restored it, and inaugurated it as a museum in 1992. The building\'s iconic pink paintwork — applied during the restoration — is now as much a part of its identity as its history.',
        year: '1906–1992',
        era: 'Colonial (1757-1947)',
      },
    ],
    historicalSignificance: 'National Heritage',
    era: ['Colonial (1757-1947)'],
    category: 'Architectural',
    location: {
      type: 'Point',
      coordinates: [90.4025, 23.7094],
      address: 'Islampur Road, Kumartoli, Old Dhaka',
      division: 'Dhaka',
      district: 'Dhaka',
    },
    coverImage:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Ahsan_Manzil.JPG/1280px-Ahsan_Manzil.JPG',
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Ahsan_Manzil.JPG/1280px-Ahsan_Manzil.JPG',
        caption: 'Ahsan Manzil viewed from the Buriganga River',
        credit: 'Wikimedia Commons',
      },
    ],
    facts: [
      {
        title: 'The Pink Palace',
        content:
          'The distinctive pink paintwork was applied during the 1990s restoration and is now one of the most recognisable features of Old Dhaka.',
        icon: 'paint',
      },
      {
        title: 'Birth of the Muslim League',
        content: 'The All India Muslim League was founded at Ahsan Manzil in 1906.',
        icon: 'history',
      },
    ],
    timeline: [
      { year: '1872', event: 'Palace completed by Nawab Abdul Ghani' },
      { year: '1906', event: 'Founding meeting of the All India Muslim League held in the palace grounds' },
      { year: '1947', event: 'Decline of the Nawabs following Partition of India' },
      { year: '1992', event: 'Restored and inaugurated as a public museum' },
    ],
    practicalInfo: {
      openingHours: 'Sat–Wed 10:30 AM–5:30 PM, Thu 10:30 AM–12:30 PM, Fri closed',
      entryFee: { local: 'BDT 20', foreign: 'USD 5' },
      bestTimeToVisit: 'Year-round',
      howToReach: 'Boat from Sadarghat launch terminal; rickshaw from Old Dhaka; 20 min from Motijheel.',
    },
    heritageScore: 90,
    tags: ['colonial', 'Nawab', 'Dhaka', 'palace', 'museum', 'old Dhaka', 'Indo-Saracenic'],
    featured: false,
    published: true,
  },

  // ── 8. Kantajew Temple ───────────────────────────────────────────
  {
    name: { en: 'Kantajew Temple', bn: 'কান্তজীউ মন্দির' },
    slug: 'kantajew-temple',
    subtitle: 'The finest terracotta temple in Bangladesh — a jewel of the Dinajpur plain',
    description: {
      short:
        'Built in 1752 by Maharaja Pran Nath of Dinajpur, the Kantajew Temple is renowned for its extraordinary terracotta ornamentation depicting scenes from Hindu mythology and Mughal court life.',
      full:
        'The Kantajew (Kantaji) Temple near Dinajpur is widely considered the finest example of late medieval terracotta temple architecture in Bangladesh. Dedicated to the Hindu god Krishna (Kantaji is a name of Krishna), the temple was built between 1704 and 1752 by Maharaja Pran Nath and his son Ramnath of Dinajpur. The entire exterior surface of the three-storey structure is covered in richly detailed terracotta plaques depicting scenes from the Mahabharata, the Ramayana, the Krishna Lila, and everyday Mughal court life — over 15,000 individual plaques in total.',
    },
    story: [
      {
        chapter: 1,
        title: 'The Maharaja\'s Devotion',
        content:
          'In the early 18th century, Maharaja Pran Nath, the wealthy zamindar of Dinajpur, commissioned a temple to enshrine an idol of Krishna that had been recovered from the Ganges. The project consumed decades and the resources of a great estate. Local craftsmen from across Bengal were brought to Dinajpur, where they worked for years fashioning thousands of individual terracotta tiles, each a unique work of art.',
        year: '1704–1722',
        era: 'Mughal (1576-1757)',
      },
      {
        chapter: 2,
        title: 'A Temple in Terracotta',
        content:
          'The temple is a classic example of the "rekha deul" or curved tower style common to Orissa-influenced Bengali Hindu architecture, but its scale and the profusion of its decoration are unmatched. Each tile tells a story: here, Krishna dances among the gopis; there, the battle of Kurukshetra rages; nearby, Mughal nobles smoke hookah and courtiers perform music. The mingling of religious narrative with contemporary Mughal court scenes is a unique feature of 18th-century Bengali folk art.',
        year: 'c. 1752',
        era: 'Mughal (1576-1757)',
      },
      {
        chapter: 3,
        title: 'Earthquake, Restoration, and Survival',
        content:
          'In 1897 a great earthquake destroyed the nine pinnacles (shikhara) that once crowned the three-storey temple, permanently changing its profile. Despite this loss, the extraordinary terracotta cladding survived largely intact. The temple remained an active place of worship and pilgrimage, particularly during the annual Ras Mela festival each November when tens of thousands of devotees gather. A major conservation effort in recent decades has stabilised the structure and secured the remarkable terracotta artwork for future generations.',
        year: '1897 onwards',
        era: 'Colonial (1757-1947)',
      },
    ],
    historicalSignificance: 'National Heritage',
    era: ['Mughal (1576-1757)', 'Colonial (1757-1947)'],
    category: 'Religious',
    location: {
      type: 'Point',
      coordinates: [88.5419, 25.8501],
      address: 'Kantanagar, Kaharol Upazila, Dinajpur',
      division: 'Rangpur',
      district: 'Dinajpur',
    },
    coverImage:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Kantaji_Temple%2C_Dinajpur_%28front%29.jpg/1280px-Kantaji_Temple%2C_Dinajpur_%28front%29.jpg',
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Kantaji_Temple%2C_Dinajpur_%28front%29.jpg/1280px-Kantaji_Temple%2C_Dinajpur_%28front%29.jpg',
        caption: 'Kantajew Temple, Dinajpur — terracotta facade',
        credit: 'Wikimedia Commons',
      },
    ],
    facts: [
      {
        title: 'Over 15,000 Terracotta Tiles',
        content: 'The temple\'s exterior is covered in more than 15,000 individual terracotta plaques.',
        icon: 'art',
      },
      {
        title: 'Annual Ras Mela',
        content: 'Tens of thousands of Hindu devotees gather here each November for the Ras Mela festival.',
        icon: 'calendar',
      },
    ],
    timeline: [
      { year: '1704', event: 'Construction begins under Maharaja Pran Nath' },
      { year: '1752', event: 'Temple completed by his son Maharaja Ramnath' },
      { year: '1897', event: 'Earthquake destroys the nine shikhara (pinnacles)' },
    ],
    practicalInfo: {
      openingHours: 'Open daily, sunrise to sunset',
      entryFee: { local: 'BDT 20', foreign: 'USD 5' },
      bestTimeToVisit: 'November (Ras Mela) or Oct–Feb',
      howToReach: 'Bus from Dinajpur town (~20 km); auto-rickshaw or local transport to Kantanagar village.',
    },
    heritageScore: 91,
    tags: ['terracotta', 'temple', 'Hindu', 'Dinajpur', 'Rangpur', 'Krishna', 'medieval'],
    featured: false,
    published: true,
  },

  // ── 9. Shrine of Bayazid Bostami ────────────────────────────────
  {
    name: { en: 'Shrine of Bayazid Bostami', bn: 'বায়েজিদ বোস্তামীর মাজার' },
    slug: 'shrine-of-bayazid-bostami',
    subtitle: 'A revered Sufi shrine atop a hill in Chattogram',
    description: {
      short:
        'Perched on a hilltop in Chattogram, the shrine of Bayazid Bostami is one of the most visited holy sites in Bangladesh.',
      full:
        'The Shrine of Bayazid Bostami sits atop a low hill in the Nasirabad area of Chattogram, Bangladesh\'s second-largest city. Tradition holds that the 9th-century Persian Sufi saint Abu Yazid al-Bistami (Bayazid Bostami) visited this site, although historical evidence is debated. The shrine complex includes a mosque, a three-domed mausoleum, and a large tank at the foot of the hill inhabited by freshwater black soft-shell turtles and terrapins that are regarded as sacred by visitors. Pilgrims from across the country visit the shrine year-round, making it one of the most important centres of devotion in the Chattogram region.',
    },
    story: [
      {
        chapter: 1,
        title: 'The Legend of the Sufi Saint',
        content:
          'Abu Yazid Tayfur ibn Isa ibn Sorushān al-Bistāmi, known in Bengal as Bayazid Bostami, was a renowned 9th-century Persian mystic and one of the founders of the ecstatic (sukr) school of Sufism. According to local tradition, the saint travelled to the Chittagong hills during a journey through South and Southeast Asia, attracted by the spiritual energy of the landscape. Whether or not the historical Bayazid actually visited Bengal, his name became firmly attached to this hilltop site, and over the centuries a shrine grew up around the legend.',
        year: '9th century AD',
        era: 'Ancient (pre-1200)',
      },
      {
        chapter: 2,
        title: 'The Sacred Turtles',
        content:
          'At the foot of the shrine hill lies a large tank teeming with Nilssonia nigricans (black soft-shell turtles) and other freshwater terrapins. Local belief holds that these creatures are the descendants of evil jinn who were transformed into turtles by the saint\'s spiritual power. Devotees feed them offerings of bread and puffed rice, and harming the animals is considered taboo. The tank has become an attraction in its own right, drawing visitors who come both for devotion and to see the remarkably tame turtles.',
        year: 'Medieval period',
        era: 'Sultanate (1200-1576)',
      },
      {
        chapter: 3,
        title: 'Chattogram\'s Spiritual Landmark',
        content:
          'Today the shrine complex is one of the defining landmarks of Chattogram. The hilltop has been landscaped and a modern three-domed structure houses the cenotaph of the saint. Every Thursday evening (the traditional Sufi gathering night) the shrine is packed with devotees who come to offer prayers, light incense, and seek blessings. The site is also an important stop for tourists visiting Chattogram and provides sweeping views of the surrounding city and hills.',
        year: 'Modern era',
        era: 'Modern Bangladesh',
      },
    ],
    historicalSignificance: 'Regional Heritage',
    era: ['Ancient (pre-1200)', 'Sultanate (1200-1576)', 'Modern Bangladesh'],
    category: 'Religious',
    location: {
      type: 'Point',
      coordinates: [91.8121, 22.3622],
      address: 'Nasirabad, Chattogram',
      division: 'Chattogram',
      district: 'Chattogram',
    },
    coverImage:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Bayazid_Bostami_Shrine_Chittagong.jpg/1280px-Bayazid_Bostami_Shrine_Chittagong.jpg',
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Bayazid_Bostami_Shrine_Chittagong.jpg/1280px-Bayazid_Bostami_Shrine_Chittagong.jpg',
        caption: 'Shrine of Bayazid Bostami, Chattogram',
        credit: 'Wikimedia Commons',
      },
    ],
    facts: [
      {
        title: 'Sacred Turtles',
        content: 'The tank at the shrine harbours endangered black soft-shell turtles believed to be transformed jinn.',
        icon: 'turtle',
      },
      {
        title: 'Hilltop Shrine',
        content: 'The shrine sits atop one of the highest points in Chattogram city, offering panoramic views.',
        icon: 'mountain',
      },
    ],
    timeline: [
      { year: '9th c. AD', event: 'Traditional date of Bayazid Bostami\'s visit to Chittagong' },
      { year: 'Medieval', event: 'Shrine established; sacred turtle population grows' },
      { year: '20th c.', event: 'Modern shrine complex and mosque constructed' },
    ],
    practicalInfo: {
      openingHours: 'Open daily, 6 AM–9 PM',
      entryFee: { local: 'Free', foreign: 'Free' },
      bestTimeToVisit: 'Year-round; Thursday evenings for Sufi gatherings',
      howToReach: 'CNG auto-rickshaw or bus from Chattogram city centre (~20 min). Located in Nasirabad area.',
    },
    heritageScore: 82,
    tags: ['Sufi', 'shrine', 'Chattogram', 'turtles', 'pilgrimage', 'religious'],
    featured: false,
    published: true,
  },

  // ── 10. Shrine of Hazrat Shah Jalal ──────────────────────────────
  {
    name: { en: 'Shrine of Hazrat Shah Jalal', bn: 'হযরত শাহজালালের মাজার' },
    slug: 'shrine-of-hazrat-shah-jalal',
    subtitle: 'The greatest Muslim shrine in north-eastern Bangladesh',
    description: {
      short:
        'The dargah of the 14th-century Sufi saint Hazrat Shah Jalal in Sylhet is one of the most visited pilgrimage sites in Bangladesh.',
      full:
        'The Shrine of Hazrat Shah Jalal (Dargah-e-Shah Jalal) in the heart of Sylhet city is the most venerated Muslim holy site in north-eastern Bangladesh. Shah Jalal al-Mujarrad (1271–1346) was a Sufi saint of Yemeni-Turkmen origin who arrived in Sylhet in 1303 with 360 companions (aulia) and is credited with bringing Islam to the Sylhet region. His mausoleum, topped by a distinctive silver dome, attracts millions of pilgrims annually. The complex includes a mosque, a tank of sacred catfish, and the relics of the saint.',
    },
    story: [
      {
        chapter: 1,
        title: 'The Conquest of Sylhet',
        content:
          'In the early 14th century, the Bengal Sultanate struggled to extend its authority to the Hindu kingdom of Srihatta (Sylhet), ruled by King Gaur Govinda. After several failed military campaigns, Sultan Shamsuddin Firuz Shah of Bengal dispatched the warrior-general Syed Nasiruddin alongside the renowned Sufi saint Hazrat Shah Jalal, who came from Delhi with 360 devoted companions. According to tradition, Shah Jalal\'s spiritual powers assured the Muslim forces of victory, and Sylhet was brought under the Sultanate in 1303 AD.',
        year: '1303 AD',
        era: 'Sultanate (1200-1576)',
      },
      {
        chapter: 2,
        title: 'A Life of Devotion',
        content:
          'After the conquest, Shah Jalal chose to remain in Sylhet rather than return to Delhi. He devoted the rest of his life to prayer, teaching, and the welfare of the people. He is said to have lived simply, never marrying, and distributing everything he received to the poor. His companions (aulia) spread across the Sylhet region, establishing communities and mosques. Shah Jalal\'s reputation as a saint of extraordinary piety grew during his lifetime, and by his death in 1346 he was already venerated as the greatest Muslim holy man of Bengal.',
        year: '1303–1346 AD',
        era: 'Sultanate (1200-1576)',
      },
      {
        chapter: 3,
        title: 'A Living Shrine',
        content:
          'Today the Dargah of Shah Jalal is the spiritual heart of Sylhet. Millions of pilgrims visit every year to pray at his tomb, which lies beneath a silver-domed mausoleum surrounded by fragrant incense and devotional offerings. Within the complex, a tank houses sacred catfish (known as gajari machh) believed to have been created by the saint. The relics preserved at the dargah include a cloak said to have been given to Shah Jalal by the Prophet Muhammad in a dream. The shrine is a place of deep emotion, where faith and history are inseparable.',
        year: '14th century–present',
        era: 'Modern Bangladesh',
      },
    ],
    historicalSignificance: 'National Heritage',
    era: ['Sultanate (1200-1576)', 'Modern Bangladesh'],
    category: 'Religious',
    location: {
      type: 'Point',
      coordinates: [91.8687, 24.8993],
      address: 'Dargah Mahalla, Sylhet',
      division: 'Sylhet',
      district: 'Sylhet',
    },
    coverImage:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Shah_Jalal_Dargah.jpg/1280px-Shah_Jalal_Dargah.jpg',
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Shah_Jalal_Dargah.jpg/1280px-Shah_Jalal_Dargah.jpg',
        caption: 'Shrine of Hazrat Shah Jalal, Sylhet',
        credit: 'Wikimedia Commons',
      },
    ],
    facts: [
      {
        title: '360 Aulia',
        content: 'Shah Jalal arrived in Sylhet with 360 saintly companions, whose tombs are scattered across the region.',
        icon: 'users',
      },
      {
        title: 'Sacred Catfish',
        content: 'The shrine complex contains a tank of catfish believed to have been created by Shah Jalal.',
        icon: 'fish',
      },
      {
        title: 'Sylhet International Airport',
        content: 'The airport serving Sylhet is named Osmani International Airport, but the city itself is often called the "City of Shah Jalal."',
        icon: 'plane',
      },
    ],
    timeline: [
      { year: '1303', event: 'Shah Jalal arrives in Sylhet; conquest of the kingdom of Gaur Govinda' },
      { year: '1346', event: 'Death of Shah Jalal; shrine established at his tomb' },
      { year: '16th–19th c.', event: 'Shrine expanded by successive rulers and devotees' },
      { year: 'Present', event: 'Millions of pilgrims visit annually; major national heritage site' },
    ],
    practicalInfo: {
      openingHours: 'Open daily; mosque prayers at standard times',
      entryFee: { local: 'Free', foreign: 'Free' },
      bestTimeToVisit: 'Year-round; special gatherings on Eid and Urs festivals',
      howToReach: 'Rickshaw or CNG from Sylhet Railway Station (~10 min). Located in the city centre.',
    },
    heritageScore: 93,
    tags: ['Sufi', 'shrine', 'Sylhet', 'Shah Jalal', 'pilgrimage', 'Sultanate', 'religious'],
    featured: false,
    published: true,
  },

  // ── 11. Durga Sagar ──────────────────────────────────────────────
  {
    name: { en: 'Durga Sagar', bn: 'দুর্গা সাগর' },
    slug: 'durga-sagar',
    subtitle: 'The largest pond in southern Bangladesh — a cultural oasis in Barishal',
    description: {
      short:
        'Durga Sagar, near Madhabpasha in Barishal, is the largest manmade pond in southern Bangladesh, dug in the 18th century by Raj Shiv Narayan.',
      full:
        'Durga Sagar is an enormous manmade reservoir located about 12 kilometres from Barishal city in the village of Madhabpasha, Babuganj upazila. Excavated in the late 18th century by Shiv Narayan Roy, the Zamindar (landlord) of Madhabpasha, the pond was named after his mother Durga Devi. Covering an area of approximately 25 acres, it is the largest historical pond in the Barishal division and one of the largest in all of Bangladesh. The site is culturally significant as a centre for the annual Hindu Baruni Snan festival, and its tree-lined banks have made it a popular destination for day-trippers from Barishal.',
    },
    story: [
      {
        chapter: 1,
        title: 'The Zamindar\'s Gift',
        content:
          'In the late 18th century, Shiv Narayan Roy was one of the most powerful zamindars (feudal landlords) of the Bakerganj region (modern Barishal). To provide fresh water to the local population and to honour his mother Durga Devi, he commissioned the excavation of a massive pond near his estate in Madhabpasha village. Hundreds of labourers dug for years, eventually creating a body of water so large that it was called a "sagar" (sea) — a name reserved for the grandest tanks in Bengali culture.',
        year: 'c. 1780 AD',
        era: 'Colonial (1757-1947)',
      },
      {
        chapter: 2,
        title: 'A Cultural Gathering Place',
        content:
          'Durga Sagar quickly became more than just a source of water. Every year during the Bengali month of Chaitra (March–April), thousands of Hindu devotees gather at its ghats (bathed steps) for the Baruni Snan — a ritual bathing festival believed to wash away sin. The surrounding groves of coconut, betel nut, and mango trees host fairs, markets, and cultural performances during the festival season. For the Hindu community of Barishal, Durga Sagar is inseparable from their religious and cultural identity.',
        year: '19th century',
        era: 'Colonial (1757-1947)',
      },
      {
        chapter: 3,
        title: 'A Heritage at Risk',
        content:
          'In recent decades, encroachment, pollution, and declining water levels have threatened Durga Sagar. Local activists and heritage organisations have campaigned to protect the pond and its surrounding environment. The Bangladesh Department of Archaeology has recognised it as a heritage site, and tree-planting drives have helped restore some of the green canopy. Today the pond, with its calm waters reflecting ancient trees, remains a symbol of the generosity and cultural richness of the Barishal region.',
        year: '21st century',
        era: 'Modern Bangladesh',
      },
    ],
    historicalSignificance: 'Cultural Landmark',
    era: ['Colonial (1757-1947)', 'Modern Bangladesh'],
    category: 'Cultural',
    location: {
      type: 'Point',
      coordinates: [90.3050, 22.6483],
      address: 'Madhabpasha, Babuganj Upazila, Barishal',
      division: 'Barishal',
      district: 'Barishal',
    },
    coverImage:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Durga_Sagar_Barisal.jpg/1280px-Durga_Sagar_Barisal.jpg',
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Durga_Sagar_Barisal.jpg/1280px-Durga_Sagar_Barisal.jpg',
        caption: 'Durga Sagar, Madhabpasha, Barishal',
        credit: 'Wikimedia Commons',
      },
    ],
    facts: [
      {
        title: 'Largest Pond in Barishal',
        content: 'At approximately 25 acres, Durga Sagar is the largest historical pond in southern Bangladesh.',
        icon: 'water',
      },
      {
        title: 'Baruni Snan Festival',
        content: 'Thousands of Hindu devotees gather annually for the Baruni Snan ritual bathing at the pond\'s ghats.',
        icon: 'calendar',
      },
    ],
    timeline: [
      { year: 'c. 1780', event: 'Zamindar Shiv Narayan Roy commissions the excavation of the pond' },
      { year: '19th c.', event: 'Becomes a major site for the annual Baruni Snan festival' },
      { year: '2000s', event: 'Heritage conservation efforts launched to protect the site' },
    ],
    practicalInfo: {
      openingHours: 'Open daily, dawn to dusk',
      entryFee: { local: 'Free', foreign: 'Free' },
      bestTimeToVisit: 'March–April (Baruni Snan festival) or November–February (cool season)',
      howToReach: 'Auto-rickshaw from Barishal city (~30 min to Madhabpasha). Barishal is connected to Dhaka by launch and bus.',
    },
    heritageScore: 76,
    tags: ['pond', 'cultural', 'Barishal', 'Hindu', 'festival', 'zamindar', 'heritage'],
    featured: false,
    published: true,
  },

  // ── 12. Shashi Lodge ─────────────────────────────────────────────
  {
    name: { en: 'Shashi Lodge', bn: 'শশী লজ' },
    slug: 'shashi-lodge',
    subtitle: 'A jewel of colonial architecture in Mymensingh',
    description: {
      short:
        'Shashi Lodge is a stunning colonial-era building in Mymensingh, built in 1905 by the local zamindar Kumar Shashi Kanta Acharya Chowdhury.',
      full:
        'Shashi Lodge (also spelled Sashi Lodge) is a magnificent two-storey palace in Mymensingh town, on the western bank of the Brahmaputra River. It was built in 1905 by Kumar Shashi Kanta Acharya Chowdhury, one of the most prominent zamindars of the Mymensingh Raj. The building combines European Baroque and Neoclassical elements with local Bengali craftsmanship — featuring ornate cornices, Corinthian columns, decorative plasterwork, and a grand central staircase. After independence it was converted into a women\'s teacher training college and more recently has been partially opened as a heritage attraction. The lodge is considered one of the finest surviving examples of colonial-era zamindar architecture in the Mymensingh division.',
    },
    story: [
      {
        chapter: 1,
        title: 'The Zamindars of Mymensingh',
        content:
          'In the 19th century, the Acharya Chowdhury family were among the most powerful zamindars of Mymensingh, which was one of the largest and wealthiest districts of Bengal. The family\'s estates stretched across vast tracts of land north of Dhaka. Eager to display their status and keep pace with the Westernised tastes of the colonial elite, the zamindars commissioned a series of grand buildings — courthouses, temples, and residences — that transformed the town of Mymensingh into a showcase of Indo-European architecture.',
        year: '19th century',
        era: 'Colonial (1757-1947)',
      },
      {
        chapter: 2,
        title: 'Building the Lodge',
        content:
          'Kumar Shashi Kanta Acharya Chowdhury commissioned the lodge in 1905, naming it after himself. The architect drew from European pattern books popular in colonial India: the façade is a riot of Corinthian pilasters, pediments, and floral plasterwork, while the interior featured marble floors, Belgian glass, and a sweeping wooden staircase. The building served as a grand residence and social venue, hosting cultural gatherings, literary evenings, and religious festivals for the zamindar\'s extended household and guests.',
        year: '1905',
        era: 'Colonial (1757-1947)',
      },
      {
        chapter: 3,
        title: 'From Palace to Heritage',
        content:
          'After the Partition of India in 1947, the Acharya Chowdhury family left for India, and the lodge was taken over by the government. It served for many years as a women\'s teacher training college. Though decades of institutional use took their toll on the ornate interiors, the essential structure and façade survived remarkably well. In recent years, growing awareness of Mymensingh\'s architectural heritage has led to conservation discussions and the building has attracted increasing numbers of heritage-conscious visitors. Shashi Lodge is now recognised as one of the most beautiful colonial-era buildings in northern Bangladesh.',
        year: '1947–present',
        era: 'Modern Bangladesh',
      },
    ],
    historicalSignificance: 'Regional Heritage',
    era: ['Colonial (1757-1947)', 'Modern Bangladesh'],
    category: 'Architectural',
    location: {
      type: 'Point',
      coordinates: [90.4007, 24.7539],
      address: 'Mymensingh town, on the bank of the Brahmaputra',
      division: 'Mymensingh',
      district: 'Mymensingh',
    },
    coverImage:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Shashi_Lodge_Mymensingh.jpg/1280px-Shashi_Lodge_Mymensingh.jpg',
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Shashi_Lodge_Mymensingh.jpg/1280px-Shashi_Lodge_Mymensingh.jpg',
        caption: 'Shashi Lodge, Mymensingh',
        credit: 'Wikimedia Commons',
      },
    ],
    facts: [
      {
        title: 'Corinthian Columns',
        content: 'The lodge\'s façade features elaborate Corinthian columns and European-style plasterwork, rare in northern Bangladesh.',
        icon: 'building',
      },
      {
        title: 'Zamindar Heritage',
        content: 'Mymensingh was home to some of Bengal\'s wealthiest zamindars; Shashi Lodge is one of their finest surviving residences.',
        icon: 'crown',
      },
    ],
    timeline: [
      { year: '1905', event: 'Shashi Lodge built by Kumar Shashi Kanta Acharya Chowdhury' },
      { year: '1947', event: 'Zamindar family leaves after Partition; lodge taken over by the government' },
      { year: '2000s', event: 'Heritage awareness grows; conservation discussions begin' },
    ],
    practicalInfo: {
      openingHours: 'Exterior viewable daily; interior access may require permission',
      entryFee: { local: 'Free', foreign: 'Free' },
      bestTimeToVisit: 'November to February',
      howToReach: 'Rickshaw from Mymensingh Railway Station (~10 min). Mymensingh is ~2.5 hours from Dhaka by train.',
    },
    heritageScore: 78,
    tags: ['colonial', 'zamindar', 'Mymensingh', 'architecture', 'palace', 'Brahmaputra'],
    featured: false,
    published: true,
  },
];

// ─── Seeder function ─────────────────────────────────────────────

const seedDB = async () => {
  await connectDB();

  if (process.argv.includes('--clear')) {
    await Promise.all([
      User.deleteMany(),
      Place.deleteMany(),
      Review.deleteMany(),
      Story.deleteMany(),
    ]);
    console.log('\x1b[33m✓ All data cleared\x1b[0m');
  } else {
    // Create admin user
    const existing = await User.findOne({ email: adminUser.email });
    let admin;
    if (existing) {
      admin = existing;
      console.log('\x1b[36mℹ Admin user already exists — skipping\x1b[0m');
    } else {
      admin = await User.create(adminUser);
      console.log('\x1b[32m✓ Admin user created\x1b[0m');
    }

    // Seed places
    let seededCount = 0;
    for (const placeData of places) {
      const exists = await Place.findOne({ slug: placeData.slug });
      if (exists) {
        console.log(`\x1b[36mℹ Place "${placeData.name.en}" already exists — skipping\x1b[0m`);
        continue;
      }
      await Place.create({ ...placeData, createdBy: admin._id });
      console.log(`\x1b[32m✓ Seeded: ${placeData.name.en}\x1b[0m`);
      seededCount++;
    }

    console.log(`\n\x1b[32m✓ Seeding complete — ${seededCount} place(s) inserted\x1b[0m`);
    console.log(`\x1b[36m  Admin login: ${adminUser.email} / ${adminUser.password}\x1b[0m`);
  }

  process.exit(0);
};

seedDB().catch((err) => {
  console.error('\x1b[31m✗ Seeder error:\x1b[0m', err.message);
  process.exit(1);
});
