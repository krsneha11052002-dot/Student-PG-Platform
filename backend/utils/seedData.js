const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const PG = require('../models/PG');
const Review = require('../models/Review');

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Seeding StaySmart AI database...');

    await User.deleteMany({});
    await PG.deleteMany({});
    await Review.deleteMany({});

    const salt = await bcrypt.genSalt(10);

    const studentUser = await User.create({
      name: 'Aarav Sharma',
      email: 'student@staysmart.com',
      passwordHash: await bcrypt.hash('student123', salt),
      role: 'student',
      isVerified: true,
      university: 'IIT Tech Hub'
    });

    const ownerUser = await User.create({
      name: 'Rajesh Malhotra',
      email: 'owner@staysmart.com',
      passwordHash: await bcrypt.hash('owner123', salt),
      role: 'owner',
      isVerified: true,
      phone: '+91 98765 43210'
    });

    const adminUser = await User.create({
      name: 'StaySmart Admin',
      email: 'admin@staysmart.com',
      passwordHash: await bcrypt.hash('admin123', salt),
      role: 'admin',
      isVerified: true
    });

    const pg1 = await PG.create({
      title: 'UrbanNest Luxury Student PG & Co-Living',
      ownerId: ownerUser._id,
      ownerName: ownerUser.name,
      ownerPhone: ownerUser.phone,
      location: 'North Campus, University District',
      city: 'Metro Hub',
      pricePerMonth: 12500,
      deposit: 15000,
      roomType: 'Sharing',
      gender: 'Co-Ed',
      sharingCapacity: '2 Sharing',
      occupancyStatus: '2 Beds Available',
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
      ],
      amenities: ['High-Speed Wi-Fi', 'Air Conditioning', '3-Time Meals included', '24/7 Security CCTV', 'Biometric Entry'],
      description: 'Ultra-modern student co-living space located just 5 minutes walk from North Campus.',
      rating: 4.8,
      reviewsCount: 2,
      isVerified: true,
      featured: true,
      status: 'approved'
    });

    await Review.create({
      pgId: pg1._id,
      userName: studentUser.name,
      userRole: 'Verified Student',
      rating: 5,
      comment: 'Super fast internet and awesome food menu!'
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}
