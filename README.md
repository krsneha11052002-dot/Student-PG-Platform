# 🏠 StaySmart AI — Full-Stack AI-Powered Student Housing & Community Platform

StaySmart AI is an end-to-end platform for university students and PG accommodation owners. It provides verified PG listing search, zero-brokerage owner management, AI roommate matching, campus community hubs, and 7-tab analytics dashboards.

---

## 🌟 Key Features

### 1. 🏠 Verified PG Search & Listings
- Search accommodations near university campuses (BITS Pilani, IIT Delhi, VIT Vellore, DU, Pune Univ).
- Filter by rent budget slider, gender category (Girls Only, Boys Only), room occupancy, and amenities.
- Side-by-side PG comparison drawer and saved wishlist manager.

### 2. 🤖 10 AI Intelligence Modules
- **AI Discussion Summarizer**: Summarizes 100+ community forum posts in seconds.
- **AI Roommate Matcher**: Ranks compatible peers by study habits, sleep cycle, and department.
- **AI Spam & Scam Detector**: Automatically flags suspicious marketplace listings and fake reviews.
- **AI Translation Engine**: Translates student reviews into 8+ regional languages.
- **AI Marketplace Recommender & Auto-Category Detector**: Intelligent product tagging.
- **AI Trending Topics & Campus Insights**: Real-time university trend analytics.

### 3. 👥 Verified Campus Community Hub
- Threaded discussions, Lost & Found claims, Local student services directory (tiffin, xerox, laundry).
- 24/7 Campus Emergency SOS alert dispatch.

### 4. 📊 Role-Based Dashboards & Analytics
- **Student Dashboard**: Saved wishlist, AI roommate match preview, notifications center.
- **Owner Dashboard**: Direct PG property listing management, occupancy charts, bed capacity.
- **Admin Dashboard (7 Tabs)**: Overview KPIs, complaint tickets, marketplace analytics, review sentiment, moderation queue, user directory, AI model health.
- **Community Dashboard (4 Tabs)**: Campus trade volume, hot topics leaderboard, AI classification, exportable PDF reports.

### 5. 🎨 Modern Production UI & UX
- Glassmorphism design system (`Inter` & `Outfit` fonts).
- Responsive mobile quick-navigation bar & drawer.
- Skeleton loaders (`SkeletonCard`), Error Boundaries, and Toast Notifications.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express, MongoDB (with high-performance In-Memory Store fallback)
- **Authentication**: JWT, bcryptjs, role-based access control (Student / Owner / Admin)

---

## 🛠️ Local Setup & Running

```bash
# Clone the repository
git clone https://github.com/krsneha11052002-dot/Student-PG-Platform.git
cd Student-PG-Platform

# Install root dependencies
npm install

# Run Backend API and Frontend Dev Server together
npm run dev
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

---

## ☁️ Deployment on Render

1. Connect this repository on [Render.com](https://render.com).
2. Set **Build Command**: `npm run build`
3. Set **Start Command**: `npm start`
4. Live site URL: `https://student-pg-platform.onrender.com`
