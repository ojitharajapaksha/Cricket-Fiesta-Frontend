# Next.js Frontend - Cricket Fiesta

Real-time event management system frontend built with Next.js 14, TypeScript, and Socket.IO.

## 🚀 Features

- **Real-time Updates** via Socket.IO
- **Responsive Design** with Tailwind CSS
- **Component Library** with Shadcn/UI
- **State Management** with Zustand
- **Data Fetching** with React Query
- **QR Code Scanning** with device camera
- **Live Match Scoring**
- **Real-time Notifications**
- **Photo Gallery**
- **Interactive Polls**

## 📦 Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/UI Components
- Socket.IO Client
- React Query
- Zustand
- Recharts for data visualization

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

For production (Vercel):
```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_WS_URL=https://your-backend.onrender.com
```

### 3. Start Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment on Vercel

### Automatic Deployment:

1. **Push to GitHub**
2. **Import Project** in Vercel
3. **Configure Environment Variables**:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_WS_URL`
4. **Deploy**

### Manual Deployment:

```bash
npm run build
vercel --prod
```

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js 14 App Router
│   ├── dashboard/          # Dashboard page
│   ├── players/            # Player management
│   ├── teams/              # Team management
│   ├── matches/            # Match management
│   ├── food/               # Food distribution
│   ├── committee/          # Committee management
│   ├── awards/             # Awards system
│   └── scanner/            # QR code scanner
├── components/             # React components
│   ├── ui/                 # Shadcn UI components
│   └── app-sidebar.tsx     # Sidebar navigation
├── lib/                    # Utilities
│   ├── api.ts              # API client
│   ├── socket.ts           # Socket.IO client
│   └── utils.ts            # Helper functions
├── hooks/                  # Custom React hooks
│   ├── useSocket.ts        # WebSocket hook
│   └── useRealtime.ts      # Real-time data hook
└── types/                  # TypeScript types
```

## 🔌 Real-time Features

### Socket.IO Integration

```typescript
import { useSocket } from '@/hooks/useSocket';

function Component() {
  const socket = useSocket();

  useEffect(() => {
    socket?.on('match:score-update', (data) => {
      // Handle real-time score update
    });

    return () => {
      socket?.off('match:score-update');
    };
  }, [socket]);
}
```

### Real-time Events:
- Match score updates
- Live commentary
- Food queue updates
- Player registrations
- Emergency alerts
- Notifications
- Photo uploads
- Poll results

## 📱 Pages

### Dashboard (`/dashboard`)
- Real-time statistics
- Live match updates
- Food distribution progress
- Attendance tracking

### Players (`/players`)
- Player list with search/filter
- Add new player
- Bulk import
- QR code generation

### Matches (`/matches`)
- Match schedule
- Live scoring interface
- Ball-by-ball commentary
- Match statistics

### Food Distribution (`/food`)
- QR code scanner
- Queue management
- Distribution statistics

### Teams (`/teams`)
- Team management
- Player assignment
- Team statistics

## 🎨 Styling

Using Tailwind CSS with custom theme configuration.

## 🧪 Testing

```bash
npm run test
```

## 📄 License

MIT License
