# Recall AI - Memory Management Application

A modern, AI-powered memory management application built with React, TypeScript, Vite, React Router, and Zustand.

## 🚀 Features

- **Memory Management**: Create, view, edit, and organize your memories
- **Intelligent Search**: Search memories by title, content, and tags with filtering capabilities
- **Categorization**: Organize memories into Work, Personal, Learning, and Other categories
- **Rating System**: Rate memories by importance (1-10)
- **Tag System**: Tag memories for better organization and discovery
- **User Profiles**: Manage user preferences and settings
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── layout/         # Layout components (Header, Sidebar, Layout)
│   ├── cards/          # Card components (MemoryCard)
│   ├── buttons/        # Button components
│   └── inputs/         # Input components
├── pages/              # Page components (routable pages)
│   ├── HomePage.tsx
│   ├── SearchPage.tsx
│   ├── CreateMemoryPage.tsx
│   ├── MemoryDetailPage.tsx
│   ├── ProfilePage.tsx
│   └── NotFoundPage.tsx
├── stores/             # Zustand state management stores
│   ├── memoryStore.ts  # Memory management state
│   ├── authStore.ts    # Authentication state
│   └── uiStore.ts      # UI state (sidebar, dark mode)
├── types/              # TypeScript type definitions
│   └── index.ts
├── router/             # React Router configuration
│   └── index.tsx
├── styles/             # Global styles
│   └── globals.css
├── App.tsx             # Root component
└── main.tsx            # Application entry point
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router DOM 7
- **State Management**: Zustand 5
- **Styling**: Custom CSS with design tokens
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 🎨 Design System

The application uses a carefully crafted color palette and typography system:

### Colors
- **Primary**: #3B82F6 (Blue)
- **Secondary**: #10B981 (Green)
- **Accent**: #F59E0B (Amber)
- **Background**: #FFFFFF
- **Text Primary**: #1F2937
- **Text Secondary**: #6B7280

### Components
- **Buttons**: Primary, Secondary, Accent variants with consistent styling
- **Cards**: Shadow effects and hover states for visual feedback
- **Input Fields**: Focus states and error handling
- **Badges**: Color-coded categories (Primary, Success, Warning, Error)

## 📊 State Management

### Memory Store
- Manages memory list, CRUD operations
- Filter memories by category and tags
- Calculate statistics (total, weekly count, avg rating)

### Auth Store
- User authentication state
- Loading states for async operations
- User profile information

### UI Store
- Sidebar visibility toggle
- Dark mode toggle (ready for implementation)
- Global UI state management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

The app will be available at `http://localhost:3000`

## 📋 Routing Map

- `/` - Home page (dashboard)
- `/search` - Search and filter memories
- `/create` - Create new memory
- `/memory/:id` - View memory detail
- `/profile` - User profile and settings
- `*` - Not found page

## 🔄 Data Flow

1. User signs in → Auth Store updates
2. Create memory → Added to Memory Store
3. Memory Store triggers re-renders in Home/Search pages
4. Navigation via React Router updates routes and pages
5. Layout components (Header/Sidebar) remain persistent

## 🎯 Next Steps for Development

1. **Backend Integration**: Connect to API for persistent data storage
2. **Authentication**: Implement email/password authentication
3. **Database**: Set up database for memory persistence
4. **AI Features**: Integrate AI for intelligent search and recommendations
5. **Dark Mode**: Implement dark mode toggle functionality
6. **Real-time Sync**: Add real-time memory synchronization
7. **Mobile App**: Create mobile-native version

## 📝 Notes

- All styling is done with custom CSS and component classes
- State management is centralized in Zustand stores
- Type-safe throughout with full TypeScript support
- Responsive design uses flexbox and grid layouts
- Accessibility features included (semantic HTML, ARIA labels)

---

Built with ❤️ using React and Vite
