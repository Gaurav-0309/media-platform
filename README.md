# 📸 CIG Media Platform

A centralized **Event & Media Management Platform** built for clubs and societies to upload, organize, access, and interact with event media seamlessly — powered by AI image tagging, facial recognition, and real-time notifications.

🌐 **Live Demo**: https://media-platformm.onrender.com
🔧 **Backend API**: https://media-platform-4br8.onrender.com
📁 **GitHub**: https://github.com/YOURUSERNAME/cig-media-platform

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Local Setup](#local-setup)
- [Deployment](#deployment)
- [User Roles](#user-roles)
- [AI Features](#ai-features)
- [Evaluation Criteria](#evaluation-criteria)

---

## 🎯 Overview

Clubs and societies generate hundreds of photos during events — photoshoots, workshops, trips, competitions, cultural fests, and parties. This media ends up scattered across Google Drives, personal folders, and random cloud links.

**CIG Media Platform** solves this by providing:
- A single place to upload and organize all event media
- AI-powered auto-tagging so photos are searchable instantly
- Facial recognition so members can find photos of themselves
- Social features like likes, comments, and real-time notifications
- Role-based access control for admins, photographers, members, and viewers

---

## ✨ Features

### 🎭 Event Management
- Create, edit, and delete events with title, description, date, and category
- Event-wise media albums — every photo belongs to an event
- Sort events by date, name, or category
- Public and private event access control
- Filter events by category (Cultural, Sports, Workshop, Trip, Competition, Party)

### 📤 Media Upload System
- **Drag and drop** upload — drop files directly onto the event page
- **Preview before upload** — see thumbnails of selected files before they go to S3
- **Bulk upload** — upload up to 50 files at once
- **Automatic compression** using Sharp before storing to S3
- **Thumbnail generation** for fast gallery loading
- **Video support** — upload and store MP4 videos
- **Cloud storage** via AWS S3

### 🔐 Authentication & Access Control
- JWT-based authentication with 7-day token expiry
- Four role system with middleware protection on every route:

| Role | Create Events | Upload | View Private | Delete Any | Admin Panel |
|------|:---:|:---:|:---:|:---:|:---:|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Photographer | ✅ | ✅ | ✅ | Own only | ❌ |
| Member | ❌ | ❌ | ✅ | ❌ | ❌ |
| Viewer | ❌ | ❌ | ❌ | ❌ | ❌ |

### ❤️ Social Features
- **Like / Unlike** photos with instant count update
- **Comment** on photos with real-time display
- **Save to Favourites** — personal collection across all events
- **Tag users** in photos with notification to tagged user
- **Share** — copy shareable link to any photo
- **Download** with dynamic watermark (club name + event name + user role)
- **Real-time notifications** via Socket.io for likes, comments, and tags

### 🤖 AI / ML Features
- **Smart Auto-Tagging** — AWS Rekognition analyzes every uploaded photo and generates tags like "Mountain", "Beach", "Crowd", "Sports" automatically
- **Advanced Search** — search by AI tag, event name, username, or date range
- **Facial Recognition** — upload a selfie, find all event photos containing your face
  - Upload reference selfie → face indexed in AWS Rekognition collection
  - Search all event photos for matching faces
  - View results in personalized "My Photos" section

### ☁️ Cloud Integration
- **AWS S3** — scalable media storage with public read access
- **AWS Rekognition** — AI image analysis and facial recognition
- **Presigned uploads** — files go directly to S3 via server
- **CDN URLs** — fast media delivery

### 🔔 Real-time Notifications
- Socket.io with per-user rooms
- Instant notification when someone likes your photo
- Instant notification when someone comments on your photo
- Instant notification when someone tags you in a photo
- Notification bell with unread count badge
- Mark all as read functionality

### 🎁 Bonus Features
- **QR code generation** for album sharing
- **Infinite scroll / pagination** — load more photos on demand
- **Admin dashboard** — manage all events in a table view
- **Role-based UI** — features shown based on user role
- **Search page** with date range filter
- **Media preview** before upload confirmation

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI framework |
| Vite | 5 | Build tool |
| React Router DOM | 6 | Client-side routing |
| Zustand | 4 | State management |
| Axios | 1 | HTTP client |
| Socket.io Client | 4 | Real-time notifications |
| React Dropzone | 14 | Drag and drop uploads |
| React Hot Toast | 2 | Toast notifications |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4 | Web framework |
| MongoDB | 7 | Database |
| Mongoose | 8 | ODM |
| JWT + bcryptjs | — | Authentication |
| Socket.io | 4 | Real-time communication |
| Multer | 1 | File upload handling |
| Sharp | 0.33 | Image compression + thumbnails |
| Jimp | 0.16 | Watermarking |
| QRCode | 1 | QR code generation |

### Cloud & AI
| Service | Purpose |
|---------|---------|
| AWS S3 | Media storage (photos, videos, thumbnails, selfies) |
| AWS Rekognition | Auto-tagging + facial recognition |

### Deployment
| Service | Purpose |
|---------|---------|
| Render Web Service | Backend hosting |
| Render Static Site | Frontend hosting |
| MongoDB Atlas | Cloud database |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND — React + Vite                    │
│         https://media-platformm.onrender.com            │
│  Auth │ Events │ Upload+Preview │ MyPhotos │ Notifs     │
└────────────────────┬────────────────────────────────────┘
                     │ REST API + Socket.io
                     ▼
┌─────────────────────────────────────────────────────────┐
│           BACKEND — Node.js + Express                   │
│       https://media-platform-4br8.onrender.com          │
│  Auth │ Events │ Media │ Social │ Search │ AI Routes    │
│              JWT + Role Middleware                       │
└──────┬──────────┬──────────┬──────────┬────────────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
┌──────────┐ ┌────────┐ ┌────────┐ ┌──────────────────┐
│ MongoDB  │ │ AWS S3 │ │  AWS   │ │   Socket.io       │
│  Atlas   │ │ Media  │ │ Rekog- │ │  Real-time        │
│ Database │ │ Store  │ │ nition │ │  Notifications    │
└──────────┘ └────────┘ └────────┘ └──────────────────┘
                              │
                    ┌─────────────────┐
                    │  Sharp + Jimp   │
                    │ Compression +   │
                    │ Watermarking    │
                    └─────────────────┘
```

---

## 🗄️ Database Schema

### Collections Overview

**Users** — stores account info, role, and face recognition data
```
_id, name, email, passwordHash, role, avatarUrl, selfieUrl, faceId, createdAt
```

**Events** — stores event metadata
```
_id, title, description, category, eventDate, isPrivate, createdBy(→Users), createdAt
```

**Media** — stores uploaded photo/video metadata
```
_id, eventId(→Events), uploadedBy(→Users), s3Key, cdnUrl, thumbnailUrl,
mediaType, isPrivate, fileSize, aiTags[], likes[], comments[], taggedUsers[], favouritedBy[], createdAt
```

**Notifications** — stores real-time notification records
```
_id, recipient(→Users), actor(→Users), type(LIKE|COMMENT|PHOTO_TAG), media(→Media), isRead, createdAt
```

**FaceIndex** — stores Rekognition face match results
```
_id, userId(→Users), mediaId(→Media), rekognitionFaceId, confidence, createdAt
```

**Tags** — stores auto-generated AI tags
```
_id, name, usageCount
```

### Relationships
```
Users     ──< Events        (one user creates many events)
Users     ──< Media         (one user uploads many media)
Events    ──< Media         (one event has many media)
Users     ──< Notifications (one user receives many notifications)
Media     ──< Notifications (one media triggers many notifications)
Users     ──< FaceIndex     (one user matched in many photos)
Media     ──< FaceIndex     (one media indexes many faces)
```

---

## 📁 Project Structure

```
cig-media-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js      ← register, login, getMe
│   │   │   ├── eventController.js     ← CRUD for events
│   │   │   ├── mediaController.js     ← upload, bulk, download, delete
│   │   │   ├── socialController.js    ← like, comment, favourite, tag
│   │   │   ├── searchController.js    ← global search with filters
│   │   │   └── aiController.js        ← selfie upload, my photos, index faces
│   │   ├── middleware/
│   │   │   └── auth.js                ← JWT protect + requireRole
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Event.js
│   │   │   ├── Media.js
│   │   │   ├── Notification.js
│   │   │   ├── Tag.js
│   │   │   └── FaceIndex.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   ├── mediaRoutes.js
│   │   │   ├── socialRoutes.js
│   │   │   ├── searchRoutes.js
│   │   │   └── aiRoutes.js
│   │   ├── services/
│   │   │   ├── s3Service.js           ← upload, compress, thumbnail, delete
│   │   │   ├── rekognitionService.js  ← detect labels, index face, search faces
│   │   │   └── watermarkService.js    ← dynamic watermark on download
│   │   └── index.js                   ← express app + socket.io + mongoose
│   ├── .env                           ← never committed
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js               ← axios instance + interceptors
    │   ├── components/
    │   │   └── Layout.jsx             ← sidebar + topbar + notifications
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Home.jsx               ← events grid + create/edit/delete
    │   │   ├── EventPage.jsx          ← gallery + upload + lightbox
    │   │   ├── Search.jsx             ← search by tag/event/user/date
    │   │   ├── MyPhotos.jsx           ← facial recognition results
    │   │   ├── Favourites.jsx         ← saved photos
    │   │   └── AdminDashboard.jsx     ← admin event management
    │   ├── store/
    │   │   └── authStore.js           ← zustand auth state
    │   ├── App.jsx                    ← router + protected routes
    │   └── main.jsx
    └── package.json
```

---

## 🔌 API Documentation

### Auth
```
POST   /api/auth/register     Register new user
POST   /api/auth/login        Login and get JWT token
GET    /api/auth/me           Get current logged-in user
```

### Events
```
GET    /api/events                    Get all events (supports ?sort=date&category=Cultural&search=fest)
GET    /api/events/:id                Get single event
POST   /api/events                    Create event        [Admin, Photographer]
PUT    /api/events/:id                Update event        [Admin, Photographer]
DELETE /api/events/:id                Delete event        [Admin]
```

### Media
```
POST   /api/media/upload              Upload single file  [Admin, Photographer]
POST   /api/media/upload/bulk         Bulk upload files   [Admin, Photographer]
GET    /api/media/event/:eventId      Get event media (supports ?page=1&limit=20)
GET    /api/media/:id/download        Download with watermark
DELETE /api/media/:id                 Delete media        [Admin, Photographer]
GET    /api/media/event/:eventId/qr   Get QR code for album sharing
```

### Social
```
POST   /api/social/:id/like           Toggle like on a photo
POST   /api/social/:id/comment        Add comment to a photo
DELETE /api/social/:id/comment/:cid   Delete a comment
POST   /api/social/:id/favourite      Toggle save to favourites
POST   /api/social/:id/tag            Tag a user in a photo
GET    /api/social/favourites         Get my saved photos
GET    /api/social/notifications      Get my notifications
PUT    /api/social/notifications/read Mark all notifications as read
```

### Search
```
GET    /api/search?q=beach&type=tag           Search by AI tag
GET    /api/search?q=Annual&type=event        Search by event name
GET    /api/search?q=John&type=user           Search by username
GET    /api/search?q=fest                     Global search (all types)
GET    /api/search?q=sky&from=2025-01-01      Search with date range
GET    /api/search/tags?q=sky                 Tag autocomplete suggestions
```

### AI
```
POST   /api/ai/selfie                 Upload selfie to register face
GET    /api/ai/my-photos              Find all photos containing my face
POST   /api/ai/index-photo/:mediaId   Index all faces in a photo [Admin, Photographer]
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18 or above
- MongoDB Atlas account (free tier)
- AWS account (free tier — S3 + Rekognition)

### 1. Clone the repository
```bash
git clone https://github.com/YOURUSERNAME/cig-media-platform.git
cd cig-media-platform
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mediaplatform
JWT_SECRET=your-long-random-secret-string
PORT=5000
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-s3-bucket-name
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
```

Server runs at `http://localhost:5000`

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

### 4. AWS Setup
1. Create an S3 bucket with public read access
2. Create an IAM user with `AmazonS3FullAccess` and `AmazonRekognitionFullAccess`
3. Generate access keys and add to `.env`

---

## 🚀 Deployment

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Render Static Site | https://media-platformm.onrender.com |
| Backend | Render Web Service | https://media-platform-4br8.onrender.com |
| Database | MongoDB Atlas | Cloud hosted (M0 free tier) |
| Media Storage | AWS S3 (us-east-1) | media-platform-uploads-gaurav |
| AI Processing | AWS Rekognition (us-east-1) | Face collection: media-platform-faces |

### Deploy backend on Render
- Root directory: `backend`
- Build command: `npm install`
- Start command: `node src/index.js`
- Add all environment variables from `.env`

### Deploy frontend on Render
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`

---

## 🧠 AI Features Explained

### Auto Image Tagging
Every uploaded image is automatically sent to **AWS Rekognition DetectLabels**. It returns labels like "Mountain", "Beach", "Crowd", "Sports", "Person" with confidence scores. These are stored in the Media document and power the search feature. Minimum confidence threshold: 75%.

### Facial Recognition — How It Works
```
Step 1: Photographer uploads event photos → faces auto-indexed in Rekognition collection
Step 2: Member uploads their selfie → face indexed with their userId as ExternalImageId
Step 3: Member clicks "Find My Photos" → selfie used to search the collection
Step 4: Rekognition returns matching face IDs → cross-referenced with FaceIndex collection
Step 5: All matching event photos displayed in "My Photos" section
```

Minimum face match confidence: 90%

### Dynamic Watermarking
When any user downloads a photo, **Jimp** dynamically overlays:
```
CIG Club | [Event Name] | [User Role]
```
Watermark is applied to the downloaded copy only — the original stored in S3 remains clean.

---


MIT License — free to use and modify.
