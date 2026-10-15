import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import slugify from 'slugify';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './config/nedb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, '../../client/dist');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'utsav_darshan_production_grade_secret_key_2026';

app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper: Token generation
const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

// Middleware: Authentication
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized, token missing' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.users.findOne({ _id: decoded.id });
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    delete user.password;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges' });
  }
  next();
};

/* ========================================================
   1. AUTHENTICATION ROUTES
======================================================== */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existing = await db.users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.users.insert({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : role === 'contributor' ? 'contributor' : 'user',
      savedEvents: [],
      createdAt: new Date().toISOString()
    });

    const token = generateToken(newUser._id);
    delete newUser.password;
    res.status(201).json({ success: true, token, user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await db.users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    delete user.password;
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/auth/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

/* ========================================================
   2. EVENTS DISCOVERY & SEARCH ROUTES
======================================================== */
app.get('/api/events/featured', async (req, res) => {
  try {
    const events = await db.events.find({ status: 'published', isFeatured: true });
    res.json({ success: true, events: events.slice(0, 6) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const { city, category, search, isVerified, sort, limit = 50 } = req.query;

    let query = { status: 'published' };

    if (city && city !== 'All') {
      query.city = new RegExp(`^${city}$`, 'i');
    }
    if (category && category !== 'All') {
      query.category = new RegExp(`^${category}$`, 'i');
    }
    if (isVerified === 'true') {
      query.isVerified = true;
    }

    let events = await db.events.find(query);

    // Keyword search in name, description, venue
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      events = events.filter((ev) =>
        ev.name.toLowerCase().includes(q) ||
        (ev.description && ev.description.toLowerCase().includes(q)) ||
        (ev.city && ev.city.toLowerCase().includes(q)) ||
        (ev.venue && ev.venue.name && ev.venue.name.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sort === 'name') {
      events.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'newest') {
      events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }

    res.json({
      success: true,
      count: events.length,
      total: events.length,
      events: events.slice(0, parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/events/:idOrSlug', async (req, res) => {
  try {
    const param = req.params.idOrSlug;
    let event = await db.events.findOne({ _id: param });
    if (!event) {
      event = await db.events.findOne({ slug: param });
    }

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const related = await db.events.find({
      city: event.city,
      status: 'published',
      _id: { $ne: event._id }
    });

    res.json({ success: true, event, related: related.slice(0, 3) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Community Submission (enters pending review queue)
app.post('/api/events', async (req, res) => {
  try {
    const {
      name, description, culturalSignificance, traditionsAndHighlights,
      category, city, state, venue, startDate, endDate, startTime, endTime,
      images, organizer, sourceUrl, verificationEvidence, contributorName, contributorContact
    } = req.body;

    if (!name || !category || !city || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Please fill in all mandatory fields' });
    }

    // Duplicate detection
    const existing = await db.events.find({ city: new RegExp(`^${city}$`, 'i') });
    const normalizedName = name.trim().toLowerCase();
    const isProbableDuplicate = existing.some((ev) =>
      ev.name.toLowerCase().includes(normalizedName) || normalizedName.includes(ev.name.toLowerCase())
    );

    const slug = `${slugify(name, { lower: true, strict: true })}-${Date.now().toString().slice(-4)}`;

    const newEvent = await db.events.insert({
      name,
      slug,
      description: description || '',
      culturalSignificance: culturalSignificance || '',
      traditionsAndHighlights: traditionsAndHighlights || [],
      category,
      city,
      state: state || 'Karnataka',
      venue: venue || { name: `${city} Central Grounds`, address: city },
      coordinates: { lat: 12.9716, lng: 77.5946 },
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      startTime: startTime || '09:00 AM',
      endTime: endTime || '09:00 PM',
      images: images || { cover: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80' },
      organizer: organizer || { name: 'Community Cultural Committee' },
      sourceUrl: sourceUrl || '',
      verificationEvidence: verificationEvidence || '',
      contributorName: contributorName || 'Anonymous Citizen',
      contributorContact: contributorContact || '',
      status: 'pending', // enters moderation review queue
      isVerified: false,
      isFeatured: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Event submitted successfully! It is now in the review queue.',
      duplicateWarning: isProbableDuplicate ? 'Notice: A similar event name was detected in this city.' : null,
      event: newEvent
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bookmark / Save Event
app.post('/api/events/:id/save', protect, async (req, res) => {
  try {
    const user = await db.users.findOne({ _id: req.user._id });
    const eventId = req.params.id;
    let savedEvents = user.savedEvents || [];

    const isAlreadySaved = savedEvents.includes(eventId);
    if (isAlreadySaved) {
      savedEvents = savedEvents.filter((id) => id !== eventId);
      await db.users.update({ _id: user._id }, { $set: { savedEvents } });
      return res.json({ success: true, saved: false, message: 'Removed from saved festivals' });
    } else {
      savedEvents.push(eventId);
      await db.users.update({ _id: user._id }, { $set: { savedEvents } });
      return res.json({ success: true, saved: true, message: 'Event saved to profile!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Report Inaccurate Information
app.post('/api/events/:id/report', async (req, res) => {
  try {
    const { reportType, description, reporterEmail } = req.body;
    const report = await db.reports.insert({
      eventId: req.params.id,
      reportType,
      description,
      reporterEmail: reporterEmail || 'anonymous',
      status: 'open',
      createdAt: new Date().toISOString()
    });
    res.status(201).json({ success: true, message: 'Report submitted successfully for admin review', report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ========================================================
   3. METADATA: CITIES & CATEGORIES
======================================================== */
app.get('/api/cities', async (req, res) => {
  const cities = await db.cities.find({});
  res.json({ success: true, count: cities.length, cities });
});

app.get('/api/cities/:slug', async (req, res) => {
  const city = await db.cities.findOne({ slug: req.params.slug.toLowerCase() });
  if (!city) return res.status(404).json({ success: false, message: 'City not found' });
  res.json({ success: true, city });
});

app.get('/api/categories', async (req, res) => {
  const categories = await db.categories.find({});
  res.json({ success: true, count: categories.length, categories });
});

/* ========================================================
   4. USER PROFILE DATA
======================================================== */
app.get('/api/users/me/saved-events', protect, async (req, res) => {
  const user = await db.users.findOne({ _id: req.user._id });
  const ids = user.savedEvents || [];
  const savedEvents = await db.events.find({ _id: { $in: ids } });
  res.json({ success: true, savedEvents });
});

app.get('/api/users/me/submissions', protect, async (req, res) => {
  const submissions = await db.events.find({ contributorContact: req.user.email });
  res.json({ success: true, count: submissions.length, submissions });
});

/* ========================================================
   5. ADMIN MODERATION & ANALYTICS
======================================================== */
app.get('/api/admin/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const allEvents = await db.events.find({});
    const totalEvents = allEvents.length;
    const publishedEvents = allEvents.filter((e) => e.status === 'published').length;
    const pendingSubmissions = allEvents.filter((e) => e.status === 'pending').length;
    const needsCorrection = allEvents.filter((e) => e.status === 'needs_correction').length;
    const rejectedSubmissions = allEvents.filter((e) => e.status === 'rejected').length;

    const allReports = await db.reports.find({});
    const openReports = allReports.filter((r) => r.status === 'open').length;
    const allUsers = await db.users.find({});

    // City distribution
    const cityCounts = {};
    allEvents.filter((e) => e.status === 'published').forEach((e) => {
      cityCounts[e.city] = (cityCounts[e.city] || 0) + 1;
    });
    const eventsByCity = Object.entries(cityCounts).map(([city, count]) => ({ city, count }));

    // Category distribution
    const catCounts = {};
    allEvents.filter((e) => e.status === 'published').forEach((e) => {
      catCounts[e.category] = (catCounts[e.category] || 0) + 1;
    });
    const eventsByCategory = Object.entries(catCounts).map(([category, count]) => ({ category, count }));

    res.json({
      success: true,
      stats: {
        totalEvents,
        publishedEvents,
        pendingSubmissions,
        needsCorrection,
        rejectedSubmissions,
        openReports,
        totalUsers: allUsers.length
      },
      charts: { eventsByCity, eventsByCategory }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/submissions', protect, authorize('admin'), async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const filter = status === 'all' ? {} : { status };
    const submissions = await db.events.find(filter);
    res.json({ success: true, count: submissions.length, submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/admin/events/:id/review', protect, authorize('admin'), async (req, res) => {
  try {
    const { action, reason, isVerified } = req.body;
    let statusUpdate = 'published';
    if (action === 'reject') statusUpdate = 'rejected';
    if (action === 'request_correction') statusUpdate = 'needs_correction';
    if (action === 'archive') statusUpdate = 'archived';

    await db.events.update(
      { _id: req.params.id },
      {
        $set: {
          status: statusUpdate,
          isVerified: isVerified !== undefined ? isVerified : false,
          lastVerifiedDate: isVerified ? new Date().toISOString() : null,
          reviewNotes: reason || ''
        }
      }
    );

    res.json({ success: true, message: `Event marked as ${statusUpdate}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/reports', protect, authorize('admin'), async (req, res) => {
  const reports = await db.reports.find({});
  res.json({ success: true, count: reports.length, reports });
});

/* ========================================================
   6. AUTO-SEED DATABASE ON FIRST BOOT
======================================================== */
const seedDataIfEmpty = async () => {
  const count = await db.events.count({});
  if (count > 0) return;

  console.log('🌱 Database is empty. Seeding authentic Indian cultural festivals...');

  // Seed default Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  await db.users.insert([
    { name: 'Admin Moderator', email: 'admin@utsavdarshan.in', password: hashedPassword, role: 'admin', savedEvents: [], createdAt: new Date().toISOString() },
    { name: 'Ananya Sharma', email: 'contributor@utsavdarshan.in', password: hashedPassword, role: 'contributor', savedEvents: [], createdAt: new Date().toISOString() },
    { name: 'Rahul Verma', email: 'user@utsavdarshan.in', password: hashedPassword, role: 'user', savedEvents: [], createdAt: new Date().toISOString() }
  ]);

  // Seed Categories
  await db.categories.insert([
    { name: 'Temple & Spiritual', slug: 'temple-spiritual', description: 'Sacred temple celebrations, rathotsavas, and divine jatras', displayIcon: 'Flame' },
    { name: 'Cultural Festivals', slug: 'cultural-festivals', description: 'Grand heritage festivals with age-old community customs', displayIcon: 'Sparkles' },
    { name: 'Traditional Music & Dance', slug: 'music-dance', description: 'Classical music concerts, Yakshagana, Kathakali, and folk dances', displayIcon: 'Music' },
    { name: 'Folk & Jatras', slug: 'folk-jatras', description: 'Vibrant village melas, tribal rituals, and chariot processions', displayIcon: 'Sun' },
    { name: 'Art & Handicrafts', slug: 'art-handicrafts', description: 'Traditional craft exhibitions, pottery, handloom, and artisan showcases', displayIcon: 'Palette' },
    { name: 'Cuisine & Food Fairs', slug: 'cuisine-food', description: 'Regional harvest feasts, street food melas, and authentic culinary fairs', displayIcon: 'Utensils' }
  ]);

  // Seed Cities
  await db.cities.insert([
    {
      name: 'Bengaluru',
      slug: 'bengaluru',
      state: 'Karnataka',
      tagline: 'The Garden City of Timeless Traditions and Karaga Heritage',
      description: 'Bengaluru harmoniously balances high-tech dynamism with ancient Pete festivals, historic temples, and iconic flowering avenues.',
      coverImage: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      culturalHighlights: ['Bengaluru Karaga Shaktyotsava', 'Kadalekai Parishe Groundnut Fair', 'Chitra Santhe Art Fair', 'Basavanagudi Bull Temple celebrations']
    },
    {
      name: 'Mysuru',
      slug: 'mysuru',
      state: 'Karnataka',
      tagline: 'The Royal City of Grandeur and Dasara Splendor',
      description: 'Mysuru is the cultural crown of Karnataka, renowned worldwide for its illuminated palace, Jamboo Savari elephant procession, and classical heritage.',
      coverImage: 'https://images.unsplash.com/photo-1600100397608-f010f443b71a?auto=format&fit=crop&w=1200&q=80',
      coordinates: { lat: 12.2958, lng: 76.6394 },
      culturalHighlights: ['Mysuru Dasara Jamboo Savari', 'Chamundi Hill Chamundeshwari Rathotsava', 'Yuva Dasara Music Extravaganza']
    },
    {
      name: 'Mangaluru',
      slug: 'mangaluru',
      state: 'Karnataka',
      tagline: 'Coastal Haven of Divine Daivaradhane and Kambala',
      description: 'Mangaluru is celebrated for its sacred Bhuta Kola spirit worship, thunderous Kambala buffalo races, and vibrant coastal Dussehra.',
      coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
      coordinates: { lat: 12.9141, lng: 74.8560 },
      culturalHighlights: ['Mangalore Dasara Tiger Dance (Pili Nalike)', 'Kadur Kambala Buffalo Races', 'Kadri Manjunatha Rathotsava']
    },
    {
      name: 'Chennai',
      slug: 'chennai',
      state: 'Tamil Nadu',
      tagline: 'The Soul of Carnatic Music and Dravidian Architecture',
      description: 'Chennai is synonymous with the renowned December Margazhi music festival, majestic Kapaleeshwarar chariot festival, and classical Bharatanatyam.',
      coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
      coordinates: { lat: 13.0827, lng: 80.2707 },
      culturalHighlights: ['Margazhi Music & Dance Season', 'Mylapore Festival', 'Kapaleeshwarar Panguni Uthiram']
    },
    {
      name: 'Kolkata',
      slug: 'kolkata',
      state: 'West Bengal',
      tagline: 'City of Joy and UNESCO Intangible Cultural Heritage',
      description: 'Kolkata comes alive with breathtaking artistic pandals during Durga Puja, accompanied by reverberating Dhak drums, Sindoor Khela, and Rabindra Sangeet.',
      coverImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80',
      coordinates: { lat: 22.5726, lng: 88.3639 },
      culturalHighlights: ['Durga Puja Pandal Hopping', 'Kolkata International Film Festival', 'Dover Lane Music Conference']
    },
    {
      name: 'Jaipur',
      slug: 'jaipur',
      state: 'Rajasthan',
      tagline: 'The Pink City of Regal Forts, Folk Rhythms, and Fairs',
      description: 'Jaipur is celebrated for its majestic heritage forts, Pushkar Camel Mela tours, Gangaur processions, and vibrant Kathputli puppetry.',
      coverImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
      coordinates: { lat: 26.9124, lng: 75.7873 },
      culturalHighlights: ['Teej Festival Royal Procession', 'Gangaur Festival', 'Jaipur Literature Festival']
    },
    {
      name: 'Mumbai',
      slug: 'mumbai',
      state: 'Maharashtra',
      tagline: 'Vibrant Capital of Ganeshotsav and Kala Ghoda Arts',
      description: 'Mumbai pulses with the grand devotional rhythms of Lalbaugcha Raja Ganpati Visarjan and the Kala Ghoda open-air street arts festival.',
      coverImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
      coordinates: { lat: 19.0760, lng: 72.8777 },
      culturalHighlights: ['Ganesh Chaturthi Lalbaugcha Raja', 'Kala Ghoda Arts Festival', 'Bandra Fair Mount Mary Feast']
    },
    {
      name: 'Kochi',
      slug: 'kochi',
      state: 'Kerala',
      tagline: 'Queen of the Arabian Sea and Capital of Onam Carnival',
      description: 'Kochi offers the vibrant Onam Athachamayam parade, mesmerising Kathakali performances, and the Kochi-Muziris Contemporary Biennale.',
      coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      coordinates: { lat: 9.9312, lng: 76.2673 },
      culturalHighlights: ['Athachamayam Thrippunithura', 'Cochin Carnival Fort Kochi', 'Kathakali & Theyyam Nights']
    }
  ]);

  // Seed Events
  await db.events.insert([
    {
      name: 'Bengaluru Karaga Shaktyotsava',
      slug: 'bengaluru-karaga-shaktyotsava',
      description: 'One of the oldest festivals of Karnataka, Karaga is dedicated to Draupadi as the symbol of Shakti. The Vahnikula Kshatriya priest carries a floral pyramid pot through old Bengaluru lanes overnight without dropping it.',
      culturalSignificance: 'Rooted in the Mahabharata, Karaga symbolizes communal harmony with its historic stop at the Tawakkal Mastan Dargah in the Pete area.',
      traditionsAndHighlights: ['Floral pyramid pot balancing', 'Veerakumaras sword dance', 'Communal visit to Tawakkal Mastan Dargah', 'Midnight street procession through Tigalarapet'],
      category: 'Temple & Spiritual',
      city: 'Bengaluru',
      state: 'Karnataka',
      venue: { name: 'Sri Dharmaraya Swamy Temple', address: 'Old Taluk Cutchery Rd, Nagarathpete, Bengaluru, Karnataka 560002' },
      coordinates: { lat: 12.9688, lng: 77.5818 },
      startDate: '2026-10-18T18:00:00.000Z',
      endDate: '2026-10-20T06:00:00.000Z',
      startTime: '07:00 PM',
      endTime: '06:00 AM',
      images: { cover: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80' },
      organizer: { name: 'Sri Dharmaraya Swamy Temple Trust' },
      isVerified: true,
      lastVerifiedDate: '2026-10-01',
      status: 'published',
      isFeatured: true,
      createdAt: new Date().toISOString()
    },
    {
      name: 'Kadalekai Parishe Groundnut Fair',
      slug: 'kadalekai-parishe-groundnut-fair',
      description: 'The historic annual groundnut fair where farmers from across Karnataka, Andhra Pradesh, and Tamil Nadu offer their first harvest to the sacred Bull.',
      culturalSignificance: 'Commemorates the legend of the sacred Bull who protected farmers crops after an appeasement temple was constructed by Kempe Gowda.',
      traditionsAndHighlights: ['Roasted spiced groundnut stalls', 'Traditional toy bazaars', 'Deepotsava at Bull Temple'],
      category: 'Folk & Jatras',
      city: 'Bengaluru',
      state: 'Karnataka',
      venue: { name: 'Bull Temple (Dodda Basavana Gudi)', address: 'Bull Temple Rd, Basavanagudi, Bengaluru, Karnataka 560019' },
      coordinates: { lat: 12.9419, lng: 77.5681 },
      startDate: '2026-11-20T08:00:00.000Z',
      endDate: '2026-11-23T22:00:00.000Z',
      startTime: '08:00 AM',
      endTime: '10:00 PM',
      images: { cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80' },
      organizer: { name: 'Basavanagudi Heritage Committee' },
      isVerified: true,
      lastVerifiedDate: '2026-10-05',
      status: 'published',
      isFeatured: true,
      createdAt: new Date().toISOString()
    },
    {
      name: 'Mysuru Dasara Jamboo Savari',
      slug: 'mysuru-dasara-jamboo-savari',
      description: 'The world-famous royal festival of Karnataka culminating in the Jamboo Savari procession carrying the golden howdah with Goddess Chamundeshwari atop the lead tusker elephant.',
      culturalSignificance: 'Celebrates the victory of Good over Evil as Goddess Durga vanquished demon Mahishasura, dating back to Vijayanagara kings.',
      traditionsAndHighlights: ['100,000 bulb illumination of Mysore Palace', 'Elephant procession with 750kg Golden Howdah', 'Torchlight Parade at Bannimantap'],
      category: 'Cultural Festivals',
      city: 'Mysuru',
      state: 'Karnataka',
      venue: { name: 'Mysore Palace & Bannimantap Ground', address: 'Sayyaji Rao Rd, Mysuru 570001' },
      coordinates: { lat: 12.3051, lng: 76.6551 },
      startDate: '2026-10-22T08:00:00.000Z',
      endDate: '2026-10-31T22:00:00.000Z',
      startTime: '09:00 AM',
      endTime: '10:00 PM',
      images: { cover: 'https://images.unsplash.com/photo-1600100397608-f010f443b71a?auto=format&fit=crop&w=1200&q=80' },
      organizer: { name: 'Mysuru District Administration & Palace Board' },
      isVerified: true,
      lastVerifiedDate: '2026-10-12',
      status: 'published',
      isFeatured: true,
      createdAt: new Date().toISOString()
    },
    {
      name: 'Mangalore Dasara & Pili Nalike',
      slug: 'mangalore-dasara-pili-nalike',
      description: 'Vibrant coastal Dussehra celebrated at Kudroli Gokarnanatheshwara Temple, famous for yellow-painted tiger dancers (Pili Nalike) dancing to energetic Tashe drums.',
      culturalSignificance: 'Revitalized by philosopher and reformer Sri Narayana Guru to promote social equality and devotion.',
      traditionsAndHighlights: ['Pili Nalike acrobatics and flips', 'Nine incarnations of Navadurga idols', 'Grand midnight sea immersion at Tannirbhavi'],
      category: 'Folk & Jatras',
      city: 'Mangaluru',
      state: 'Karnataka',
      venue: { name: 'Kudroli Sri Gokarnanatheshwara Temple', address: 'Kudroli, Mangaluru, Karnataka 575003' },
      coordinates: { lat: 12.8767, lng: 74.8344 },
      startDate: '2026-10-23T10:00:00.000Z',
      endDate: '2026-10-31T23:00:00.000Z',
      startTime: '10:00 AM',
      endTime: '11:00 PM',
      images: { cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80' },
      organizer: { name: 'Kudroli Temple Development Committee' },
      isVerified: true,
      lastVerifiedDate: '2026-10-08',
      status: 'published',
      isFeatured: true,
      createdAt: new Date().toISOString()
    },
    {
      name: 'Margazhi Music and Dance Festival',
      slug: 'margazhi-music-and-dance-festival',
      description: 'The world largest classical music festival featuring over 2,000 performances by legendary vocalists, veena masters, mridangam virtuosos, and Bharatanatyam exponents.',
      culturalSignificance: 'Centuries-old December cultural gathering that transforms Chennai into the global epicenter of South Indian classical arts.',
      traditionsAndHighlights: ['Kutcheri concerts at historic Sabhas', 'Early morning Bhajan processions around Mylapore tank'],
      category: 'Traditional Music & Dance',
      city: 'Chennai',
      state: 'Tamil Nadu',
      venue: { name: 'The Music Academy', address: 'TT Krishnamachari Rd, Royapettah, Chennai 600014' },
      coordinates: { lat: 13.0427, lng: 80.2543 },
      startDate: '2026-12-15T09:00:00.000Z',
      endDate: '2027-01-05T22:00:00.000Z',
      startTime: '09:00 AM',
      endTime: '09:30 PM',
      images: { cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80' },
      organizer: { name: 'The Music Academy Madras' },
      isVerified: true,
      lastVerifiedDate: '2026-10-09',
      status: 'published',
      isFeatured: true,
      createdAt: new Date().toISOString()
    },
    {
      name: 'Kolkata Durga Puja Grand Carnival',
      slug: 'kolkata-durga-puja-grand-carnival',
      description: 'UNESCO Intangible Cultural Heritage celebration turning the entire city of Kolkata into an open-air art gallery of magnificent themed pandals, dhunuchi naach, and idol immersions.',
      culturalSignificance: 'A profound celebration of Maa Durga arrival at her maternal home, epitomizing Bengali literature, art, and unity across communities.',
      traditionsAndHighlights: ['Dhunuchi dance to resonant Dhak drums', 'Pandal hopping throughout the night', 'Sindoor Khela on Bijoya Dashami'],
      category: 'Cultural Festivals',
      city: 'Kolkata',
      state: 'West Bengal',
      venue: { name: 'Red Road Carnival Ground', address: 'Red Road, Maidan, Kolkata, West Bengal 700021' },
      coordinates: { lat: 22.5552, lng: 88.3476 },
      startDate: '2026-10-17T06:00:00.000Z',
      endDate: '2026-10-23T23:00:00.000Z',
      startTime: '06:00 AM',
      endTime: '11:59 PM',
      images: { cover: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80' },
      organizer: { name: 'Forum for Durgotsab & Bengal Tourism' },
      isVerified: true,
      lastVerifiedDate: '2026-10-11',
      status: 'published',
      isFeatured: true,
      createdAt: new Date().toISOString()
    },
    {
      name: 'Lalbaugcha Raja Ganeshotsav',
      slug: 'lalbaugcha-raja-ganeshotsav',
      description: 'The iconic Ganpati of Mumbai drawing millions of pilgrims. The grand 10-day celebration fills Mumbai streets with devotional chanting, Modak feasts, and Visarjan processions.',
      culturalSignificance: 'Instilled by freedom fighter Lokmanya Tilak as a public celebration to unite people across barriers against British rule.',
      traditionsAndHighlights: ['Navsachi line for wish fulfillment', 'Grand Visarjan procession at Girgaon Chowpatty'],
      category: 'Cultural Festivals',
      city: 'Mumbai',
      state: 'Maharashtra',
      venue: { name: 'Lalbaug Market Pavillion', address: 'Lalbaug, Mumbai 400012' },
      coordinates: { lat: 18.9912, lng: 72.8397 },
      startDate: '2026-10-15T05:00:00.000Z',
      endDate: '2026-10-25T22:00:00.000Z',
      startTime: '05:00 AM',
      endTime: '11:00 PM',
      images: { cover: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80' },
      organizer: { name: 'Lalbaugcha Raja Sarvajanik Ganeshotsav Mandal' },
      isVerified: true,
      lastVerifiedDate: '2026-10-04',
      status: 'published',
      isFeatured: true,
      createdAt: new Date().toISOString()
    },
    {
      name: 'Vasanthotsava Spring Classical Music Mela',
      slug: 'vasanthotsava-spring-classical-music-mela',
      description: 'Community-organized open spring music mela in Cubbon Park celebrating emerging classical vocalists and flute artists.',
      culturalSignificance: 'Welcoming the spring season (Vasantha Ritu) through divine music vibrations.',
      traditionsAndHighlights: ['Early morning flute recital under bamboo groves'],
      category: 'Traditional Music & Dance',
      city: 'Bengaluru',
      state: 'Karnataka',
      venue: { name: 'Cubbon Park Bandstand', address: 'Kasturba Rd, Bengaluru 560001' },
      coordinates: { lat: 12.9754, lng: 77.5929 },
      startDate: '2026-11-28T06:30:00.000Z',
      endDate: '2026-11-29T18:00:00.000Z',
      startTime: '06:30 AM',
      endTime: '06:00 PM',
      images: { cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80' },
      organizer: { name: 'Bangalore Flute Circle' },
      contributorName: 'Ananya Sharma',
      contributorContact: 'contributor@utsavdarshan.in',
      sourceUrl: 'https://karnatakaculture.gov.in/music',
      verificationEvidence: 'Official brochure PDF attached',
      status: 'pending', // Test Pending review in Admin Dashboard
      isVerified: false,
      isFeatured: false,
      createdAt: new Date().toISOString()
    }
  ]);

  console.log('✅ Seed completed successfully!');
};

// ==========================================
// 🚀 SERVE STATIC FRONTEND IN PRODUCTION
// ==========================================
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await seedDataIfEmpty();
  console.log(`🚀 UTSAV DARSHAN BACKEND ACTIVE ON http://localhost:${PORT}`);
});

export default app;
