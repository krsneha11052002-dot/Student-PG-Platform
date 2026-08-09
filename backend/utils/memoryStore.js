const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'staysmart_super_secret_jwt_key_2026';

// In-Memory Data Store (Active when MongoDB is not running locally)
const initialUsers = [
  {
    _id: 'user_student_1',
    name: 'Aarav Sharma',
    email: 'student@staysmart.com',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'student',
    isVerified: true,
    university: 'Stanford / IIT Delhi Tech',
    savedPGs: ['pg_1', 'pg_3'],
    createdAt: new Date()
  },
  {
    _id: 'user_owner_1',
    name: 'Rajesh Malhotra',
    email: 'owner@staysmart.com',
    passwordHash: bcrypt.hashSync('owner123', 10),
    role: 'owner',
    isVerified: true,
    phone: '+91 98765 43210',
    createdAt: new Date()
  },
  {
    _id: 'user_admin_1',
    name: 'StaySmart Admin',
    email: 'admin@staysmart.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    isVerified: true,
    createdAt: new Date()
  }
];

const initialPGs = [
  {
    _id: 'pg_1',
    title: 'UrbanNest Luxury Student PG & Co-Living',
    ownerId: 'user_owner_1',
    ownerName: 'Rajesh Malhotra',
    ownerPhone: '+91 98765 43210',
    location: 'North Campus, University District',
    city: 'Delhi',
    pricePerMonth: 12500,
    deposit: 15000,
    roomType: 'Sharing',
    gender: 'Co-Ed',
    sharingCapacity: '2 Sharing',
    occupancyStatus: '2 Beds Available',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    videos: ['https://www.w3schools.com/html/mov_bbb.mp4'],
    mapCoordinates: { lat: 28.6892, lng: 77.2132 },
    nearbyPlaces: [
      { name: 'Vishwavidyalaya Metro Station', distance: '450m', type: 'Metro' },
      { name: 'Kamla Nagar Market', distance: '700m', type: 'Market' },
      { name: 'Sudha Dairy Booth', distance: '100m', type: 'Food' }
    ],
    rules: ['No loud music after 10 PM', 'Overnight guests require prior approval', 'Gate closes at 11 PM', 'No smoking in rooms'],
    floorPlan: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    wishlistedBy: ['user_student_1'],
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', '3-Time Meals included', '24/7 Security CCTV', 'Biometric Entry', 'Daily Housekeeping', 'Study Lounge'],
    description: 'Ultra-modern student co-living space located just 5 minutes walk from North Campus. Features high-speed fiber internet, ergonomic study desks, biometric security, and delicious hygienic meals cooked fresh daily.',
    rating: 4.8,
    reviewsCount: 2,
    isVerified: true,
    featured: true,
    status: 'approved',
    createdAt: new Date('2026-01-15')
  },
  {
    _id: 'pg_2',
    title: 'Starlight Girls Hostel & Luxury Residency',
    ownerId: 'user_owner_1',
    ownerName: 'Rajesh Malhotra',
    ownerPhone: '+91 98765 43210',
    location: 'Knowledge Park II, Tech Zone',
    city: 'Greater Noida',
    pricePerMonth: 9800,
    deposit: 10000,
    roomType: 'Single',
    gender: 'Girls Only',
    sharingCapacity: 'Single Room',
    occupancyStatus: '1 Room Available',
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'
    ],
    videos: [],
    mapCoordinates: { lat: 28.4716, lng: 77.4977 },
    nearbyPlaces: [
      { name: 'Knowledge Park II Metro', distance: '300m', type: 'Metro' },
      { name: 'Apollo Pharmacy', distance: '200m', type: 'Medical' },
      { name: 'Local Tiffin Service', distance: '150m', type: 'Food' }
    ],
    rules: ['Girls only PG', 'Strict curfew at 10 PM', 'No outside male guests allowed', 'Keep shared kitchen clean'],
    floorPlan: '',
    wishlistedBy: [],
    amenities: ['Girls Only', 'Biometric Safety Gate', 'Attach Bath', 'Full Power Backup', 'Gym & Yoga Zone', 'Laundry Service'],
    description: 'Safe, vibrant, and peaceful accommodation exclusively for female students and working professionals. Equipped with 4-tier security system, attached bathrooms, and rooftop recreation area.',
    rating: 4.9,
    reviewsCount: 0,
    isVerified: true,
    featured: true,
    status: 'approved',
    createdAt: new Date('2026-02-01')
  },
  {
    _id: 'pg_3',
    title: 'Scholars Haven Boys Executive PG',
    ownerId: 'user_owner_1',
    ownerName: 'Rajesh Malhotra',
    ownerPhone: '+91 98765 43210',
    location: 'South Campus Avenue',
    city: 'Delhi',
    pricePerMonth: 8500,
    deposit: 9000,
    roomType: 'Sharing',
    gender: 'Boys Only',
    sharingCapacity: '3 Sharing',
    occupancyStatus: '4 Beds Available',
    images: [
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80'
    ],
    videos: [],
    mapCoordinates: { lat: 28.5835, lng: 77.1636 },
    nearbyPlaces: [
      { name: 'Durgabai Deshmukh South Campus Metro', distance: '600m', type: 'Metro' },
      { name: 'Venkateswara College Road', distance: '400m', type: 'Market' }
    ],
    rules: ['Boys only residency', 'No alcohol or illegal substances', 'Quiet hours after 11 PM'],
    floorPlan: '',
    wishlistedBy: ['user_student_1'],
    amenities: ['High-Speed Wi-Fi', 'Power Backup', 'Gaming Room', 'North & South Indian Food', 'CCTV', 'Washing Machines'],
    description: 'Affordable and student-centric PG facility right across the metro line. Great community of engineers and management students, complete with study rooms and gaming lounge.',
    rating: 4.6,
    reviewsCount: 0,
    isVerified: true,
    featured: false,
    status: 'approved',
    createdAt: new Date('2026-03-10')
  },
  {
    _id: 'pg_4',
    title: 'Aura Studio Apartments for Research Scholars',
    ownerId: 'user_owner_1',
    ownerName: 'Rajesh Malhotra',
    ownerPhone: '+91 98765 43210',
    location: 'University Science Block',
    city: 'Delhi',
    pricePerMonth: 18000,
    deposit: 20000,
    roomType: 'Studio',
    gender: 'Co-Ed',
    sharingCapacity: 'Private Studio',
    occupancyStatus: '3 Studios Available',
    images: [
      'https://images.unsplash.com/photo-1502672016866-543764835824?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
    ],
    videos: [],
    mapCoordinates: { lat: 28.6948, lng: 77.2062 },
    nearbyPlaces: [
      { name: 'GTB Nagar Metro Station', distance: '800m', type: 'Metro' },
      { name: 'University Central Library', distance: '300m', type: 'Library' }
    ],
    rules: ['Maintain quiet and study environment', 'No parties inside studio apartments', 'Waste disposal only in designated bins'],
    floorPlan: '',
    wishlistedBy: [],
    amenities: ['Private Kitchenette', 'Workstation', 'AC & Microwave', 'Smart TV', 'Housekeeping', '24/7 Power Backup'],
    description: 'Independent studio apartments tailored for research scholars, PG students, and faculty visitors needing quiet, premium individual spaces with high end work setups.',
    rating: 4.9,
    reviewsCount: 0,
    isVerified: true,
    featured: true,
    status: 'approved',
    createdAt: new Date('2026-04-05')
  }
];

const initialReviews = [
  {
    _id: 'rev_1',
    pgId: 'pg_1',
    userName: 'Aarav Sharma',
    userRole: 'Verified Student',
    rating: 5,
    title: 'Super fast internet and tasty meals',
    comment: 'The food quality is unmatched and fiber internet is super fast during assignment submissions!',
    helpful: ['user_student_1'],
    categories: { cleanliness: 5, food: 5, safety: 5, wifi: 5, value: 5 },
    verified: true,
    createdAt: new Date('2026-06-12')
  },
  {
    _id: 'rev_2',
    pgId: 'pg_1',
    userName: 'Ananya Verma',
    userRole: 'Verified Student',
    rating: 4,
    title: 'Extremely safe female-friendly PG',
    comment: 'Biometric security makes me feel extremely safe. Highly recommended for students near North Campus.',
    helpful: [],
    categories: { cleanliness: 4, food: 4, safety: 5, wifi: 3, value: 4 },
    verified: true,
    createdAt: new Date('2026-07-01')
  }
];

class MemoryStore {
  constructor() {
    this.users = [...initialUsers];
    this.pgs = [...initialPGs];
    this.reviews = [...initialReviews];
    this.complaints = [];
    this.communityPosts = [
      {
        id: 'cpost_1',
        collegeId: 'du-north',
        collegeShortName: 'DU North',
        authorName: 'Senior Student (DU)',
        authorAvatar: '👨‍🎓',
        authorBadge: 'Final Year',
        category: 'feed',
        title: 'Top 5 PG Mess Food Guide near North Campus 2026',
        content: 'Hey freshers! Here is a tested list of PGs with the cleanest messes and hygienic food near Kamla Nagar and Hudson Lane.',
        imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
        tags: ['DU North', 'PG Tips', 'Food'],
        likesCount: 42,
        likedBy: [],
        comments: [
          { commentId: 'c1', authorName: 'Priya M.', authorAvatar: '👩‍🎓', text: 'Thanks for this! Super helpful for freshers.', createdAt: new Date() }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'cpost_2',
        collegeId: 'du-north',
        collegeShortName: 'DU North',
        authorName: 'Aarav Sharma',
        authorAvatar: '👨‍💻',
        authorBadge: '2nd Year CS',
        category: 'forum',
        subCategory: 'Academics',
        title: 'How to prepare for Semester Data Structures exam?',
        content: 'Looking for previous year question papers or study notes for DU CS department. Any Drive link leads?',
        tags: ['Academics', 'CS', 'Exams'],
        likesCount: 19,
        likedBy: [],
        comments: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'cpost_3',
        collegeId: 'du-north',
        collegeShortName: 'DU North',
        authorName: 'Rohan Grad',
        authorAvatar: '🎒',
        authorBadge: 'Verified Alumnus',
        category: 'marketplace',
        title: 'Selling Study Table + Ergonomic Chair (Kamla Nagar)',
        content: 'Moving out of Delhi! Wooden study table with drawers and mesh chair. Condition 9/10. Price: ₹1,800. Pickup near Patel Chest.',
        imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
        marketplace: { price: 1800, condition: 'Like New', contactWhatsApp: '+91 98765 11111' },
        tags: ['Marketplace', 'Furniture', 'DU North'],
        likesCount: 15,
        likedBy: [],
        comments: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'cpost_4',
        collegeId: 'du-north',
        collegeShortName: 'DU North',
        authorName: 'Nandini R.',
        authorAvatar: '🔍',
        authorBadge: 'Verified Student',
        category: 'lost_found',
        title: 'LOST: Black Fastrack Backpack near Arts Faculty',
        content: 'Lost my backpack containing college ID card and notebook near Arts Faculty library canteen around 2 PM yesterday. Reward offered!',
        lostFound: { status: 'LOST', location: 'Arts Faculty Canteen', contactPhone: '+91 98765 22222' },
        tags: ['Lost & Found', 'Arts Faculty'],
        likesCount: 31,
        likedBy: [],
        comments: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'cpost_5',
        collegeId: 'du-north',
        collegeShortName: 'DU North',
        authorName: 'Campus Event Desk',
        authorAvatar: '🎉',
        authorBadge: 'Official Organizers',
        category: 'event',
        title: 'North Campus Annual Tech & Cultural Fest 2026',
        content: 'Get ready for hackathons, battle of bands, and food stalls! Registrations now open for all Delhi college students.',
        imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
        eventDetails: { eventDate: '25th Aug 2026', venue: 'North Campus Ground', organizer: 'DU Student Union', rsvpCount: 148 },
        tags: ['Fest', 'Hackathon', 'Cultural'],
        likesCount: 88,
        likedBy: [],
        comments: [],
        createdAt: new Date().toISOString()
      }
    ];
    this.localServices = [
      {
        id: 'serv_1',
        collegeShortName: 'DU North',
        title: 'Annapurna Homestyle Tiffin Service',
        category: 'Tiffin & Food',
        rating: 4.8,
        reviewsCount: 38,
        priceRange: '₹2,500/mo',
        contactPhone: '+91 98111 22334',
        address: 'Hudson Lane, Kamla Nagar',
        features: ['Breakfast + Lunch + Dinner', 'Pure Veg & Non-Veg options', 'Free PG Delivery'],
        icon: '🍱'
      },
      {
        id: 'serv_2',
        collegeShortName: 'DU North',
        title: 'Express 24/7 Student Laundry',
        category: 'Laundry & Dry Clean',
        rating: 4.6,
        reviewsCount: 29,
        priceRange: '₹50/kg',
        contactPhone: '+91 98222 33445',
        address: 'Vijay Nagar, Near Metro Station',
        features: ['Wash & Iron within 12h', 'Pickup & Drop to PG', 'Antibacterial Wash'],
        icon: '🧺'
      },
      {
        id: 'serv_3',
        collegeShortName: 'DU North',
        title: 'PrintHub & Xerox Station',
        category: 'Stationery & Printing',
        rating: 4.9,
        reviewsCount: 54,
        priceRange: '₹1/page',
        contactPhone: '+91 98333 44556',
        address: 'Patel Chest Market',
        features: ['Color & B/W Printing', 'Hardbound Thesis Binding', 'Online PDF Printing Link'],
        icon: '🖨️'
      },
      {
        id: 'serv_4',
        collegeShortName: 'DU North',
        title: 'Campus Scooty & Bike Rental',
        category: 'Bike & Scooty Rental',
        rating: 4.7,
        reviewsCount: 22,
        priceRange: '₹300/day',
        contactPhone: '+91 98444 55667',
        address: 'Vishwa Vidyalaya Metro Gate 3',
        features: ['Helmets Included', 'Electric & Petrol Scooters', 'Daily/Monthly Pass'],
        icon: '🛵'
      }
    ];
  }

  generateToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // User queries
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u._id === id);
  }

  createUser({ name, email, password, role, university, phone }) {
    const newUser = {
      _id: `user_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 10),
      role: role || 'student',
      isVerified: role === 'student',
      university: university || '',
      phone: phone || '',
      savedPGs: [],
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  toggleSavePG(userId, pgId) {
    const user = this.findUserById(userId);
    if (!user) return [];
    if (!user.savedPGs) user.savedPGs = [];
    if (user.savedPGs.includes(pgId)) {
      user.savedPGs = user.savedPGs.filter(id => id !== pgId);
    } else {
      user.savedPGs.push(pgId);
    }
    return user.savedPGs;
  }

  // PG queries
  getPGs({ search, gender, roomType, minPrice, maxPrice, amenities, sort }) {
    let list = [...this.pgs];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.location.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
      );
    }

    if (gender && gender !== 'All') {
      list = list.filter(p => p.gender === gender || p.gender === 'Co-Ed');
    }

    if (roomType && roomType !== 'All') {
      list = list.filter(p => p.roomType === roomType);
    }

    if (minPrice) {
      list = list.filter(p => p.pricePerMonth >= Number(minPrice));
    }

    if (maxPrice) {
      list = list.filter(p => p.pricePerMonth <= Number(maxPrice));
    }

    if (amenities && Array.isArray(amenities) && amenities.length > 0) {
      list = list.filter(p => 
        amenities.every(reqAmenity => p.amenities.includes(reqAmenity))
      );
    }

    // Sort
    if (sort === 'price_low') {
      list.sort((a, b) => a.pricePerMonth - b.pricePerMonth);
    } else if (sort === 'price_high') {
      list.sort((a, b) => b.pricePerMonth - a.pricePerMonth);
    } else if (sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      // Default latest
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }

  getPGById(id) {
    return this.pgs.find(p => p._id === id);
  }


  updatePGStatus(pgId, status) {
    const pg = this.getPGById(pgId);
    if (pg) {
      pg.status = status;
    }
    return pg;
  }

  deletePG(pgId) {
    const index = this.pgs.findIndex(p => p._id === pgId);
    if (index !== -1) {
      this.pgs.splice(index, 1);
      return true;
    }
    return false;
  }

  // Reviews
  getReviewsByPGId(pgId) {
    return this.reviews.filter(r => r.pgId === pgId);
  }

  addReview(pgId, { userName, userRole, rating, title, comment, categories, verified }) {
    const newReview = {
      _id: `rev_${Date.now()}`,
      pgId,
      userName: userName || 'Student User',
      userRole: userRole || 'Verified Student',
      rating: Number(rating),
      title: title || '',
      comment,
      helpful: [],
      categories: categories || { cleanliness: 5, food: 5, safety: 5, wifi: 5, value: 5 },
      verified: verified !== undefined ? verified : true,
      createdAt: new Date()
    };
    this.reviews.unshift(newReview);

    // Recalculate PG rating
    const pg = this.getPGById(pgId);
    if (pg) {
      const allRevs = this.getReviewsByPGId(pgId);
      const sum = allRevs.reduce((acc, r) => acc + r.rating, 0);
      pg.rating = Number((sum / allRevs.length).toFixed(1));
      pg.reviewsCount = allRevs.length;
    }

    return newReview;
  }

  markHelpfulReview(reviewId, userId) {
    const review = this.reviews.find(r => r._id === reviewId);
    if (!review) return null;
    if (!review.helpful) review.helpful = [];
    if (review.helpful.includes(userId)) {
      review.helpful = review.helpful.filter(id => id !== userId);
    } else {
      review.helpful.push(userId);
    }
    return review;
  }

  fileComplaint(pgId, pgTitle, userId, userName, type, description) {
    const complaint = {
      _id: `comp_${Date.now()}`,
      pgId,
      pgTitle,
      userId,
      userName,
      type,
      description,
      status: 'open',
      createdAt: new Date()
    };
    this.complaints.unshift(complaint);
    return complaint;
  }

  getComplaintsByPG(pgId) {
    return this.complaints.filter(c => c.pgId === pgId);
  }

  getComplaints() {
    return this.complaints;
  }

  getWishlist(userId) {
    const user = this.findUserById(userId);
    if (!user) return [];
    const savedIds = user.savedPGs || [];
    return this.pgs.filter(p => savedIds.includes(p._id));
  }

  createPG(data, owner) {
    const newPG = {
      _id: `pg_${Date.now()}`,
      title: data.title,
      ownerId: owner.id || owner._id,
      ownerName: owner.name || owner.ownerName || 'Property Owner',
      ownerPhone: owner.phone || data.ownerPhone || '+91 98765 00000',
      location: data.location,
      city: data.city || 'Delhi',
      pricePerMonth: Number(data.pricePerMonth),
      deposit: Number(data.deposit || data.pricePerMonth * 1.2),
      roomType: data.roomType || 'Sharing',
      gender: data.gender || 'Co-Ed',
      sharingCapacity: data.sharingCapacity || '2 Sharing',
      occupancyStatus: data.occupancyStatus || 'Available',
      images: data.images && data.images.length > 0 ? data.images : [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'
      ],
      videos: data.videos || [],
      mapCoordinates: data.mapCoordinates || { lat: 28.6139, lng: 77.2090 },
      nearbyPlaces: data.nearbyPlaces || [],
      rules: data.rules || [],
      floorPlan: data.floorPlan || '',
      wishlistedBy: [],
      amenities: data.amenities || ['High-Speed Wi-Fi', 'CCTV', 'Food Included'],
      description: data.description || 'Modern accommodation conveniently located near campus.',
      rating: 5.0,
      reviewsCount: 0,
      isVerified: true,
      featured: false,
      status: 'approved',
      createdAt: new Date()
    };

    this.pgs.unshift(newPG);
    return newPG;
  }

  // Community Helpers
  getCommunityPosts({ collegeId, category, search, subCategory }) {
    let posts = [...this.communityPosts];
    if (collegeId && collegeId !== 'all') {
      posts = posts.filter(p => p.collegeId === collegeId || p.collegeShortName.toLowerCase().includes(collegeId.toLowerCase()));
    }
    if (category && category !== 'all') {
      posts = posts.filter(p => p.category === category);
    }
    if (subCategory && subCategory !== 'all') {
      posts = posts.filter(p => p.subCategory === subCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    return posts;
  }

  addCommunityPost(postData) {
    this.communityPosts.unshift(postData);
    return postData;
  }

  toggleLikePost(postId, userId) {
    const post = this.communityPosts.find(p => p.id === postId || p._id === postId);
    if (!post) return { likesCount: 0, liked: false };
    if (!post.likedBy) post.likedBy = [];
    const isLiked = post.likedBy.includes(userId);
    if (isLiked) {
      post.likedBy = post.likedBy.filter(u => u !== userId);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likedBy.push(userId);
      post.likesCount += 1;
    }
    return { likesCount: post.likesCount, liked: !isLiked };
  }

  addCommentToPost(postId, commentObj) {
    const post = this.communityPosts.find(p => p.id === postId || p._id === postId);
    if (!post) return [];
    if (!post.comments) post.comments = [];
    post.comments.push(commentObj);
    return post.comments;
  }

  getLocalServices(collegeShortName, category) {
    let services = [...this.localServices];
    if (collegeShortName) {
      services = services.filter(s => s.collegeShortName.toLowerCase() === collegeShortName.toLowerCase() || s.collegeShortName.toLowerCase().includes(collegeShortName.toLowerCase()));
    }
    if (category && category !== 'All') {
      services = services.filter(s => s.category === category);
    }
    return services;
  }

  // Admin stats
  getAdminStats() {
    return {
      totalUsers: this.users.length,
      totalStudents: this.users.filter(u => u.role === 'student').length,
      totalOwners: this.users.filter(u => u.role === 'owner').length,
      totalPGs: this.pgs.length,
      verifiedPGs: this.pgs.filter(p => p.isVerified).length,
      pendingApprovals: this.pgs.filter(p => p.status === 'pending').length,
      totalReviews: this.reviews.length,
      totalComplaints: this.complaints.length
    };
  }
}

const memoryStore = new MemoryStore();

module.exports = { memoryStore, JWT_SECRET };
