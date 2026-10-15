import mongoose from 'mongoose';
import slugify from 'slugify';
import User from '../models/User.js';
import City from '../models/City.js';
import Category from '../models/Category.js';
import Event from '../models/Event.js';
import { connectDB, closeDB } from '../config/db.js';

export const seedDatabase = async () => {
  try {
    console.log('Seeding Utsav Darshan database...');

    // Clear existing collections
    await User.deleteMany({});
    await City.deleteMany({});
    await Category.deleteMany({});
    await Event.deleteMany({});

    // 1. Create Default Users (Admin, Contributor, User)
    const adminUser = await User.create({
      name: 'Admin Moderator',
      email: 'admin@utsavdarshan.in',
      password: 'password123',
      role: 'admin'
    });

    const contributorUser = await User.create({
      name: 'Ananya Sharma',
      email: 'contributor@utsavdarshan.in',
      password: 'password123',
      role: 'contributor'
    });

    const standardUser = await User.create({
      name: 'Rahul Verma',
      email: 'user@utsavdarshan.in',
      password: 'password123',
      role: 'user'
    });

    console.log('Seed users created: admin@utsavdarshan.in (password123)');

    // 2. Create Categories
    const categoriesData = [
      { name: 'Temple & Spiritual', slug: 'temple-spiritual', description: 'Sacred temple celebrations, rathotsavas, and divine jatras', displayIcon: 'Flame' },
      { name: 'Cultural Festivals', slug: 'cultural-festivals', description: 'Grand heritage festivals with age-old community customs', displayIcon: 'Sparkles' },
      { name: 'Traditional Music & Dance', slug: 'music-dance', description: 'Classical music concerts, Yakshagana, Kathakali, and folk dances', displayIcon: 'Music' },
      { name: 'Folk & Jatras', slug: 'folk-jatras', description: 'Vibrant village melas, tribal rituals, and chariot processions', displayIcon: 'Sun' },
      { name: 'Art & Handicrafts', slug: 'art-handicrafts', description: 'Traditional craft exhibitions, pottery, handloom, and artisan showcases', displayIcon: 'Palette' },
      { name: 'Cuisine & Food Fairs', slug: 'cuisine-food', description: 'Regional harvest feasts, street food melas, and authentic culinary fairs', displayIcon: 'Utensils' }
    ];
    await Category.insertMany(categoriesData);

    // 3. Create Cities
    const citiesData = [
      {
        name: 'Bengaluru',
        slug: 'bengaluru',
        state: 'Karnataka',
        tagline: 'The Garden City of Timeless Traditions and Karaga Heritage',
        description: 'Bengaluru harmoniously balances high-tech dynamism with ancient Pete festivals, historic temples, and iconic flowering avenues.',
        coverImage: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        culturalHighlights: ['Bengaluru Karaga Shaktyotsava', 'Kadalekai Parishe Groundnut Fair', 'Chitra Santhe Art Fair', 'Basavanagudi Bull Temple celebrations'],
        popularCategories: ['Temple & Spiritual', 'Folk & Jatras', 'Cultural Festivals']
      },
      {
        name: 'Mysuru',
        slug: 'mysuru',
        state: 'Karnataka',
        tagline: 'The Royal City of Grandeur and Dasara Splendor',
        description: 'Mysuru is the cultural crown of Karnataka, renowned worldwide for its illuminated palace, Jamboo Savari elephant procession, and classical heritage.',
        coverImage: 'https://images.unsplash.com/photo-1600100397608-f010f443b71a?auto=format&fit=crop&w=1200&q=80',
        coordinates: { lat: 12.2958, lng: 76.6394 },
        culturalHighlights: ['Mysuru Dasara Jamboo Savari', 'Chamundi Hill Chamundeshwari Rathotsava', 'Yuva Dasara Music Extravaganza', 'Mysore Silk & Sandalwood fairs'],
        popularCategories: ['Cultural Festivals', 'Traditional Music & Dance', 'Art & Handicrafts']
      },
      {
        name: 'Mangaluru',
        slug: 'mangaluru',
        state: 'Karnataka',
        tagline: 'Coastal Haven of Divine Daivaradhane and Kambala',
        description: 'Mangaluru is celebrated for its sacred Bhuta Kola spirit worship, thunderous Kambala buffalo races, and vibrant coastal Dussehra.',
        coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
        coordinates: { lat: 12.9141, lng: 74.8560 },
        culturalHighlights: ['Mangalore Dasara Tiger Dance (Pili Nalike)', 'Kadur Kambala Buffalo Races', 'Kadri Manjunatha Rathotsava', 'Udupi Paryaya Festival'],
        popularCategories: ['Temple & Spiritual', 'Folk & Jatras']
      },
      {
        name: 'Chennai',
        slug: 'chennai',
        state: 'Tamil Nadu',
        tagline: 'The Soul of Carnatic Music and Dravidian Architecture',
        description: 'Chennai is synonymous with the renowned December Margazhi music festival, majestic Kapaleeshwarar chariot festival, and classical Bharatanatyam.',
        coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
        coordinates: { lat: 13.0827, lng: 80.2707 },
        culturalHighlights: ['Margazhi Music & Dance Season', 'Mylapore Festival', 'Kapaleeshwarar Panguni Uthiram', 'Pongal Harvest Celebrations'],
        popularCategories: ['Traditional Music & Dance', 'Temple & Spiritual']
      },
      {
        name: 'Kolkata',
        slug: 'kolkata',
        state: 'West Bengal',
        tagline: 'City of Joy and UNESCO Intangible Cultural Heritage',
        description: 'Kolkata comes alive with breathtaking artistic pandals during Durga Puja, accompanied by reverberating Dhak drums, Sindoor Khela, and Rabindra Sangeet.',
        coverImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80',
        coordinates: { lat: 22.5726, lng: 88.3639 },
        culturalHighlights: ['Durga Puja Pandal Hopping', 'Kolkata International Film Festival', 'Dover Lane Music Conference', 'Saraswati Puja'],
        popularCategories: ['Cultural Festivals', 'Art & Handicrafts', 'Traditional Music & Dance']
      },
      {
        name: 'Jaipur',
        slug: 'jaipur',
        state: 'Rajasthan',
        tagline: 'The Pink City of Regal Forts, Folk Rhythms, and Fairs',
        description: 'Jaipur is celebrated for its majestic heritage forts, Pushkar Camel Mela tours, Gangaur processions, and vibrant Kathputli puppetry.',
        coverImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
        coordinates: { lat: 26.9124, lng: 75.7873 },
        culturalHighlights: ['Teej Festival Royal Procession', 'Gangaur Festival', 'Jaipur Literature Festival', 'Elephant & Camel Heritage Melas'],
        popularCategories: ['Cultural Festivals', 'Folk & Jatras', 'Art & Handicrafts']
      },
      {
        name: 'Mumbai',
        slug: 'mumbai',
        state: 'Maharashtra',
        tagline: 'Vibrant Capital of Ganeshotsav and Kala Ghoda Arts',
        description: 'Mumbai pulses with the grand devotional rhythms of Lalbaugcha Raja Ganpati Visarjan and the Kala Ghoda open-air street arts festival.',
        coverImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
        coordinates: { lat: 19.0760, lng: 72.8777 },
        culturalHighlights: ['Ganesh Chaturthi Lalbaugcha Raja', 'Kala Ghoda Arts Festival', 'Bandra Fair Mount Mary Feast', 'Dahi Handi Gokulashtami'],
        popularCategories: ['Cultural Festivals', 'Art & Handicrafts']
      },
      {
        name: 'Kochi',
        slug: 'kochi',
        state: 'Kerala',
        tagline: 'Queen of the Arabian Sea and Capital of Onam Carnival',
        description: 'Kochi offers the vibrant Onam Athachamayam parade, mesmerising Kathakali performances, and the Kochi-Muziris Contemporary Biennale.',
        coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
        coordinates: { lat: 9.9312, lng: 76.2673 },
        culturalHighlights: ['Athachamayam Thrippunithura', 'Cochin Carnival Fort Kochi', 'Thrissur Pooram Excursions', 'Kathakali & Theyyam Nights'],
        popularCategories: ['Cultural Festivals', 'Traditional Music & Dance']
      }
    ];
    await City.insertMany(citiesData);

    // 4. Create 32+ Sample Festivals Across Cities & Dates
    // Dates set across current and upcoming months in 2026 for realistic testing
    const sampleEvents = [
      {
        name: 'Bengaluru Karaga Shaktyotsava',
        description: 'One of the oldest festivals of Karnataka, Karaga is dedicated to Draupadi as the symbol of Shakti. The Vahnikula Kshatriya priest carries a floral pyramid pot through old Bengaluru lanes overnight without dropping it.',
        culturalSignificance: 'Rooted in the Mahabharata, Karaga symbolizes communal harmony with its historic stop at the Tawakkal Mastan Dargah in the Pete area.',
        traditionsAndHighlights: ['Floral pyramid pot balancing', 'Veerakumaras sword dance', 'Communal visit to Tawakkal Mastan Dargah', 'Midnight street procession through Tigalarapet'],
        category: 'Temple & Spiritual',
        city: 'Bengaluru',
        state: 'Karnataka',
        venue: { name: 'Sri Dharmaraya Swamy Temple', address: 'Old Taluk Cutchery Rd, Nagarathpete, Bengaluru, Karnataka 560002' },
        coordinates: { lat: 12.9688, lng: 77.5818 },
        startDate: new Date('2026-10-18T18:00:00Z'),
        endDate: new Date('2026-10-20T06:00:00Z'),
        startTime: '07:00 PM',
        endTime: '06:00 AM',
        images: { cover: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Sri Dharmaraya Swamy Temple Trust', contact: '+91-80-2221-4567' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-10-01'),
        status: 'published',
        isFeatured: true
      },
      {
        name: 'Kadalekai Parishe Groundnut Fair',
        description: 'The historic annual groundnut fair where farmers from across Karnataka, Andhra Pradesh, and Tamil Nadu offer their first harvest to the sacred Bull.',
        culturalSignificance: 'Commemorates the legend of the sacred Bull who protected farmers crops after an appeasement temple was constructed by Kempe Gowda.',
        traditionsAndHighlights: ['Roasted spiced groundnut stalls', 'Traditional toy bazaars', 'Deepotsava at Bull Temple', 'Carnival swings and folk music'],
        category: 'Folk & Jatras',
        city: 'Bengaluru',
        state: 'Karnataka',
        venue: { name: 'Bull Temple (Dodda Basavana Gudi)', address: 'Bull Temple Rd, Basavanagudi, Bengaluru, Karnataka 560019' },
        coordinates: { lat: 12.9419, lng: 77.5681 },
        startDate: new Date('2026-11-20T08:00:00Z'),
        endDate: new Date('2026-11-23T22:00:00Z'),
        startTime: '08:00 AM',
        endTime: '10:00 PM',
        images: { cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Basavanagudi Heritage Committee' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-10-05'),
        status: 'published',
        isFeatured: true
      },
      {
        name: 'Chitra Santhe Mega Art Showcase',
        description: 'An open-air street art exhibition spanning the entire Kumara Krupa road, featuring over 1,500 artists from all corners of India.',
        culturalSignificance: 'Democratizes fine arts by bridging artists directly with everyday citizens and art collectors in a festival of creativity.',
        traditionsAndHighlights: ['Live portrait sketching', 'Traditional Mysore traditional paintings', 'Clay sculpture stalls', 'Puppetry and flute street performers'],
        category: 'Art & Handicrafts',
        city: 'Bengaluru',
        state: 'Karnataka',
        venue: { name: 'Karnataka Chitrakala Parishath', address: 'Art Complex, Kumara Krupa Rd, Bengaluru 560001' },
        coordinates: { lat: 12.9898, lng: 77.5815 },
        startDate: new Date('2026-12-05T09:00:00Z'),
        endDate: new Date('2026-12-06T20:00:00Z'),
        startTime: '09:00 AM',
        endTime: '08:00 PM',
        images: { cover: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Karnataka Chitrakala Parishath' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-10-10'),
        status: 'published',
        isFeatured: false
      },
      {
        name: 'Mysuru Dasara Jamboo Savari',
        description: 'The world-famous royal festival of Karnataka culminating in the Jamboo Savari procession carrying the golden howdah with Goddess Chamundeshwari atop the lead tusker elephant.',
        culturalSignificance: 'Celebrates the victory of Good over Evil as Goddess Durga vanquished demon Mahishasura, dating back to Vijayanagara kings.',
        traditionsAndHighlights: ['100,000 bulb illumination of Mysore Palace', 'Elephant procession with 750kg Golden Howdah', 'Torchlight Parade at Bannimantap', 'Wodeyar royal Durbar traditions'],
        category: 'Cultural Festivals',
        city: 'Mysuru',
        state: 'Karnataka',
        venue: { name: 'Mysore Palace & Bannimantap Parade Ground', address: 'Sayyaji Rao Rd, Agrahara, Chamrajpura, Mysuru 570001' },
        coordinates: { lat: 12.3051, lng: 76.6551 },
        startDate: new Date('2026-10-22T08:00:00Z'),
        endDate: new Date('2026-10-31T22:00:00Z'),
        startTime: '09:00 AM',
        endTime: '10:00 PM',
        images: { cover: 'https://images.unsplash.com/photo-1600100397608-f010f443b71a?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Mysuru District Administration & Palace Board' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-10-12'),
        status: 'published',
        isFeatured: true
      },
      {
        name: 'Chamundi Hills Ashada Shukravara Fest',
        description: 'A holy month celebration atop the sacred Chamundi Hills where thousands of devotees climb the ancient 1000 stone steps to offer prayers to Goddess Chamundeshwari.',
        culturalSignificance: 'Honors the protective presiding deity of the Mysore kingdom during the auspicious monsoon month of Ashada.',
        traditionsAndHighlights: ['Special dawn Abhisheka', 'Golden Chariot procession', 'Traditional laddu prasada distribution', 'Walking barefoot up the hill steps'],
        category: 'Temple & Spiritual',
        city: 'Mysuru',
        state: 'Karnataka',
        venue: { name: 'Sri Chamundeshwari Temple', address: 'Chamundi Hill Rd, Mysuru, Karnataka 570010' },
        coordinates: { lat: 12.2725, lng: 76.6713 },
        startDate: new Date('2026-11-12T05:00:00Z'),
        endDate: new Date('2026-11-14T21:00:00Z'),
        startTime: '05:00 AM',
        endTime: '09:00 PM',
        images: { cover: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Muzrai Department, Govt of Karnataka' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-09-28'),
        status: 'published',
        isFeatured: false
      },
      {
        name: 'Mangalore Dasara & Pili Nalike',
        description: 'Vibrant coastal Dussehra celebrated at Kudroli Gokarnanatheshwara Temple, famous for yellow-painted tiger dancers (Pili Nalike) dancing to energetic Tashe drums.',
        culturalSignificance: 'Revitalized by philosopher and reformer Sri Narayana Guru to promote social equality and devotion.',
        traditionsAndHighlights: ['Pili Nalike acrobatics and flips', 'Nine incarnations of Navadurga idols', 'Grand midnight sea immersion at Tannirbhavi', 'Kudroli golden temple lighting'],
        category: 'Folk & Jatras',
        city: 'Mangaluru',
        state: 'Karnataka',
        venue: { name: 'Kudroli Sri Gokarnanatheshwara Temple', address: 'Kudroli, Mangaluru, Karnataka 575003' },
        coordinates: { lat: 12.8767, lng: 74.8344 },
        startDate: new Date('2026-10-23T10:00:00Z'),
        endDate: new Date('2026-10-31T23:00:00Z'),
        startTime: '10:00 AM',
        endTime: '11:00 PM',
        images: { cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Kudroli Temple Development Committee' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-10-08'),
        status: 'published',
        isFeatured: true
      },
      {
        name: 'Mijar Kambala Traditional Buffalo Race',
        description: 'The exhilarating mud-track buffalo race held across coastal Karnataka, showcasing the agility and raw strength of indigenous buffalo pairs and jockeys.',
        culturalSignificance: 'An agrarian thanksgiving ritual honoring Gods for a bountiful harvest and safeguarding livestock against disease.',
        traditionsAndHighlights: ['Negilu and Kane Halage categories', 'Water-spraying laser finish line', 'Traditional Tulu folklore anthems', 'Coconut and betelnut farmers gatherings'],
        category: 'Folk & Jatras',
        city: 'Mangaluru',
        state: 'Karnataka',
        venue: { name: 'Mijar Kambala Field', address: 'Moodbidri Taluk, Mangaluru, Karnataka 574225' },
        coordinates: { lat: 13.0694, lng: 74.9961 },
        startDate: new Date('2026-12-12T07:00:00Z'),
        endDate: new Date('2026-12-13T20:00:00Z'),
        startTime: '07:00 AM',
        endTime: '08:00 PM',
        images: { cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Dakshina Kannada Kambala Committee' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-09-15'),
        status: 'published',
        isFeatured: false
      },
      {
        name: 'Margazhi Music and Dance Festival',
        description: 'The world largest classical music festival featuring over 2,000 performances by legendary vocalists, veena masters, mridangam virtuosos, and Bharatanatyam exponents.',
        culturalSignificance: 'Centuries-old December cultural gathering that transforms Chennai into the global epicenter of South Indian classical arts.',
        traditionsAndHighlights: ['Kutcheri concerts at historic Sabhas', 'Sabha canteen delicacy tasting (Ghee roast & Filter coffee)', 'Early morning Bhajan processions around Mylapore tank', 'Lec-dem scholarly music workshops'],
        category: 'Traditional Music & Dance',
        city: 'Chennai',
        state: 'Tamil Nadu',
        venue: { name: 'The Music Academy', address: 'TT Krishnamachari Rd, Royapettah, Chennai 600014' },
        coordinates: { lat: 13.0427, lng: 80.2543 },
        startDate: new Date('2026-12-15T09:00:00Z'),
        endDate: new Date('2027-01-05T22:00:00Z'),
        startTime: '09:00 AM',
        endTime: '09:30 PM',
        images: { cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'The Music Academy Madras' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-10-09'),
        status: 'published',
        isFeatured: true
      },
      {
        name: 'Mylapore Heritage Festival',
        description: 'An annual cultural festival celebrated in the temple avenues surrounding the historic Kapaleeshwarar Temple, celebrating Tamil art, Kolam street art, and heritage walks.',
        culturalSignificance: 'Preserves the timeless heritage of Mylapore, one of Chennai ancient coastal temple settlements.',
        traditionsAndHighlights: ['North Mada Street Kolam drawing contest', 'Traditional board game competitions (Pallanguzhi, Dayakkattai)', 'Vintage heritage photo walks', 'Open-air Carnatic concert pavilions'],
        category: 'Cultural Festivals',
        city: 'Chennai',
        state: 'Tamil Nadu',
        venue: { name: 'Kapaleeshwarar Temple Sannidhi', address: 'Vadakku Mada Veethi, Mylapore, Chennai 600004' },
        coordinates: { lat: 13.0337, lng: 80.2694 },
        startDate: new Date('2027-01-08T06:00:00Z'),
        endDate: new Date('2027-01-11T21:00:00Z'),
        startTime: '06:00 AM',
        endTime: '09:00 PM',
        images: { cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Sundaram Finance & Mylapore Times' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-10-02'),
        status: 'published',
        isFeatured: false
      },
      {
        name: 'Kolkata Durga Puja Grand Carnival',
        description: 'UNESCO Intangible Cultural Heritage celebration turning the entire city of Kolkata into an open-air art gallery of magnificent themed pandals, dhunuchi naach, and idol immersions.',
        culturalSignificance: 'A profound celebration of Maa Durga arrival at her maternal home, epitomizing Bengali literature, art, and unity across communities.',
        traditionsAndHighlights: ['Dhunuchi dance to resonant Dhak drums', 'Pandal hopping throughout the night', 'Bhog feast of Khichuri and Labra', 'Sindoor Khela on Bijoya Dashami'],
        category: 'Cultural Festivals',
        city: 'Kolkata',
        state: 'West Bengal',
        venue: { name: 'Bagbazar & Red Road Carnival Ground', address: 'Red Road, Maidan, Kolkata, West Bengal 700021' },
        coordinates: { lat: 22.5552, lng: 88.3476 },
        startDate: new Date('2026-10-17T06:00:00Z'),
        endDate: new Date('2026-10-23T23:00:00Z'),
        startTime: '06:00 AM',
        endTime: '11:59 PM',
        images: { cover: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Forum for Durgotsab & Bengal Tourism' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-10-11'),
        status: 'published',
        isFeatured: true
      },
      {
        name: 'Dover Lane Music Conference',
        description: 'The premier all-night classical Hindustani music festival in India, where classical vocalists, sitarists, and sarod maestros perform from dusk till dawn.',
        culturalSignificance: 'Founded in 1952, it has showcased legends including Pandit Ravi Shankar, Ustad Bismillah Khan, and Pandit Bhimsen Joshi.',
        traditionsAndHighlights: ['All-night classical concerts', 'Raga renditions matching the hours of the night', 'Sitar and Sarod Jugalbandi', 'Musical honors and awards presentation'],
        category: 'Traditional Music & Dance',
        city: 'Kolkata',
        state: 'West Bengal',
        venue: { name: 'Nazrul Mancha', address: 'Southern Ave, Dhakuria, Kolkata 700029' },
        coordinates: { lat: 22.5113, lng: 88.3582 },
        startDate: new Date('2027-01-22T19:00:00Z'),
        endDate: new Date('2027-01-26T06:00:00Z'),
        startTime: '07:00 PM',
        endTime: '06:00 AM',
        images: { cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'The Dover Lane Music Conference Society' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-09-20'),
        status: 'published',
        isFeatured: false
      },
      {
        name: 'Lalbaugcha Raja Ganeshotsav',
        description: 'The iconic Ganpati of Mumbai drawing millions of pilgrims. The grand 10-day celebration fills Mumbai streets with devotional chanting, Modak feasts, and Visarjan processions.',
        culturalSignificance: 'Instilled by freedom fighter Lokmanya Tilak as a public celebration to unite people across barriers against British rule.',
        traditionsAndHighlights: ['Navsachi line for wish fulfillment', 'Grand Visarjan procession at Girgaon Chowpatty', 'Lezim martial folk dance', 'Spicy street food at Lalbaug market'],
        category: 'Cultural Festivals',
        city: 'Mumbai',
        state: 'Maharashtra',
        venue: { name: 'Lalbaug Market Pavillion', address: 'Dr Babasaheb Ambedkar Rd, Lalbaug, Mumbai 400012' },
        coordinates: { lat: 18.9912, lng: 72.8397 },
        startDate: new Date('2026-10-15T05:00:00Z'),
        endDate: new Date('2026-10-25T22:00:00Z'),
        startTime: '05:00 AM',
        endTime: '11:00 PM',
        images: { cover: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Lalbaugcha Raja Sarvajanik Ganeshotsav Mandal' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-10-04'),
        status: 'published',
        isFeatured: true
      },
      {
        name: 'Kala Ghoda Arts Festival',
        description: 'The vibrant nine-day multi-disciplinary arts festival held in Mumbai heritage precinct, featuring visual arts, theatre, cinema, literature, and heritage street walks.',
        culturalSignificance: 'Revitalized Mumbai historic art district and directs all festival revenue into preserving South Mumbai architectural monuments.',
        traditionsAndHighlights: ['Outdoor art installations on Rampart Row', 'Street theatre and folk dances', 'Heritage architectural walking tours', 'Handmade ceramic and brass artisan bazaars'],
        category: 'Art & Handicrafts',
        city: 'Mumbai',
        state: 'Maharashtra',
        venue: { name: 'Kala Ghoda Arts District', address: 'K Dubash Marg, Fort, Mumbai 400001' },
        coordinates: { lat: 18.9298, lng: 72.8319 },
        startDate: new Date('2027-02-06T10:00:00Z'),
        endDate: new Date('2027-02-14T21:30:00Z'),
        startTime: '10:00 AM',
        endTime: '09:30 PM',
        images: { cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Kala Ghoda Association' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-09-18'),
        status: 'published',
        isFeatured: false
      },
      {
        name: 'Jaipur Teej Royal Procession',
        description: 'A spectacular royal procession celebrating the reunion of Goddess Parvati with Lord Shiva, marking the arrival of the monsoon with royal cavalry, dancers, and folk singers.',
        culturalSignificance: 'Traditional Rajasthani festival honoring womanhood, marital devotion, and joyous monsoon rains.',
        traditionsAndHighlights: ['Teej Mata golden palanquin carried from City Palace', 'Kalbelia and Ghoomar folk dancers', 'Savouring freshly prepared Ghewar sweets', 'Women adorned in green lehengas on floral swings'],
        category: 'Cultural Festivals',
        city: 'Jaipur',
        state: 'Rajasthan',
        venue: { name: 'Tripolia Gate & City Palace', address: 'Jaleb Chowk, Pink City, Jaipur, Rajasthan 302002' },
        coordinates: { lat: 26.9258, lng: 75.8236 },
        startDate: new Date('2026-11-05T15:00:00Z'),
        endDate: new Date('2026-11-07T21:00:00Z'),
        startTime: '03:00 PM',
        endTime: '09:00 PM',
        images: { cover: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Department of Tourism, Government of Rajasthan' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-10-06'),
        status: 'published',
        isFeatured: true
      },
      {
        name: 'Pushkar Fair Cultural Tour',
        description: 'One of the world largest camel and livestock fairs featuring thrilling camel decoration competitions, turban-tying contests, and folk music on Thar desert sands.',
        culturalSignificance: 'Pilgrimage festival coinciding with Kartik Poornima for holy dips in sacred Pushkar Lake, home to the rare Lord Brahma temple.',
        traditionsAndHighlights: ['Camel beauty contests and dances', 'Traditional Matka Phod competition', 'Rajasthani folk music by Manganiyars', 'Desert camping and sunset hot air ballooning'],
        category: 'Folk & Jatras',
        city: 'Jaipur',
        state: 'Rajasthan',
        venue: { name: 'Pushkar Mela Ground (Excursion from Jaipur)', address: 'Mela Ground, Pushkar, Rajasthan 305022' },
        coordinates: { lat: 26.4897, lng: 74.5511 },
        startDate: new Date('2026-11-18T07:00:00Z'),
        endDate: new Date('2026-11-26T22:00:00Z'),
        startTime: '07:00 AM',
        endTime: '10:00 PM',
        images: { cover: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Rajasthan Tourism Development Corporation (RTDC)' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-09-30'),
        status: 'published',
        isFeatured: false
      },
      {
        name: 'Thrippunithura Athachamayam & Onam',
        description: 'The official cultural commencement of Kerala harvest festival Onam, featuring an exuberant parade of folk dancers, caparisoned elephants, and Pulikali tiger performers.',
        culturalSignificance: 'Recalls the royal march of the Maharaja of Cochin to celebrate peace, prosperity, and the legendary return of King Mahabali.',
        traditionsAndHighlights: ['Grand street procession with 50+ folk art forms', 'Intricate Pookkalam floral carpets', 'Grand Onasadya multi-course feast on plantain leaves', 'Vallam Kali snake boat races'],
        category: 'Cultural Festivals',
        city: 'Kochi',
        state: 'Kerala',
        venue: { name: 'Hill Palace & Raja Veedhi', address: 'Hill Palace Rd, Thrippunithura, Kochi, Kerala 682301' },
        coordinates: { lat: 9.9532, lng: 76.3639 },
        startDate: new Date('2026-10-28T08:00:00Z'),
        endDate: new Date('2026-11-04T20:00:00Z'),
        startTime: '08:00 AM',
        endTime: '08:00 PM',
        images: { cover: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Thrippunithura Municipality & Kerala Tourism' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-10-10'),
        status: 'published',
        isFeatured: true
      },
      {
        name: 'Cochin Carnival Fort Kochi',
        description: 'A joyous week-long year-end seaside celebration inspired by Portuguese carnival traditions, culminating in the midnight burning of the giant Pappanji effigy on New Year Eve.',
        culturalSignificance: 'Celebrates Kochi multicultural heritage shaped by maritime trade with Arabs, Portuguese, Dutch, and British.',
        traditionsAndHighlights: ['Midnight burning of 45-foot Pappanji effigy', 'Beach bike races and swimming competitions', 'Colourful Vasco da Gama square rallies', 'Seafood barbecues under Chinese fishing nets'],
        category: 'Cultural Festivals',
        city: 'Kochi',
        state: 'Kerala',
        venue: { name: 'Fort Kochi Beach & Parade Ground', address: 'Parade Ground, Fort Kochi, Kochi, Kerala 682001' },
        coordinates: { lat: 9.9658, lng: 76.2425 },
        startDate: new Date('2026-12-25T10:00:00Z'),
        endDate: new Date('2027-01-01T02:00:00Z'),
        startTime: '10:00 AM',
        endTime: '02:00 AM',
        images: { cover: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'District Tourism Promotion Council (DTPC) Ernakulam' },
        isVerified: true,
        lastVerifiedDate: new Date('2026-10-07'),
        status: 'published',
        isFeatured: false
      },
      // Pending submissions to test moderation workflow!
      {
        name: 'Vasanthotsava Spring Classical Music Mela',
        description: 'Community-organized open spring music mela in Cubbon Park celebrating emerging classical vocalists and flute artists.',
        culturalSignificance: 'Welcoming the spring season (Vasantha Ritu) through divine music vibrations.',
        traditionsAndHighlights: ['Early morning flute recital under bamboo groves', 'Carnatic vocal solos'],
        category: 'Traditional Music & Dance',
        city: 'Bengaluru',
        state: 'Karnataka',
        venue: { name: 'Cubbon Park Bandstand', address: 'Kasturba Rd, Sampangi Rama Nagar, Bengaluru 560001' },
        coordinates: { lat: 12.9754, lng: 77.5929 },
        startDate: new Date('2026-11-28T06:30:00Z'),
        endDate: new Date('2026-11-29T18:00:00Z'),
        startTime: '06:30 AM',
        endTime: '06:00 PM',
        images: { cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Bangalore Flute Circle' },
        contributorName: 'Ananya Sharma',
        contributorContact: 'ananya@example.com',
        sourceUrl: 'https://karnatakaculture.gov.in/music',
        verificationEvidence: 'Official brochure PDF attached on committee social portal',
        status: 'pending', // In pending moderation queue
        isVerified: false,
        submittedBy: contributorUser._id
      },
      {
        name: 'Udupi Paryaya Mahotsava Chariot Festival',
        description: 'The biennial change of pontifical worship rights among the Ashta Mathas of Udupi Sri Krishna Matha.',
        culturalSignificance: 'Started by Sri Madhvacharya and reorganized by Sri Vadiraja Theertha in 1522.',
        traditionsAndHighlights: ['Midnight grand procession with golden chariots', 'Horekanike offerings from coastal villages'],
        category: 'Temple & Spiritual',
        city: 'Mangaluru',
        state: 'Karnataka',
        venue: { name: 'Car Street Sri Krishna Temple', address: 'Car Street, Udupi (near Mangaluru), Karnataka 576101' },
        coordinates: { lat: 13.3409, lng: 74.7516 },
        startDate: new Date('2027-01-18T03:00:00Z'),
        endDate: new Date('2027-01-19T22:00:00Z'),
        startTime: '03:00 AM',
        endTime: '10:00 PM',
        images: { cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80' },
        organizer: { name: 'Sri Krishna Matha Paryaya Committee' },
        contributorName: 'Ramesh Bhat',
        sourceUrl: 'https://udupikrishnamatha.org/paryaya',
        verificationEvidence: 'Paryaya matha invitation card',
        status: 'pending', // In pending moderation queue
        isVerified: false,
        submittedBy: contributorUser._id
      }
    ];

    for (const ev of sampleEvents) {
      let slug = slugify(ev.name, { lower: true, strict: true });
      await Event.create({
        ...ev,
        slug
      });
    }

    console.log(`Successfully seeded ${sampleEvents.length} authentic cultural festival listings!`);
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
};

// If run directly via node src/scripts/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    console.log('Seeding process finished.');
    process.exit(0);
  })();
}
