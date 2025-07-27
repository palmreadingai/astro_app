# PalmAI Web App

A comprehensive React-based palm reading application providing palm analysis, kundli generation, horoscope readings, and AI-powered chat consultations.

## 📁 Project Structure & File Organization

### Core Application Files
```
src/
├── App.tsx                     # Main application component - handles screen routing
├── main.tsx                    # Application entry point - React app initialization
├── index.css                   # Global styles and Tailwind imports
└── vite-env.d.ts              # Vite environment type definitions
```

### Component Architecture

#### Authentication Components (`src/components/Auth/`)
- **LandingPage.tsx**: Welcome screen with app introduction
  - Marketing content and feature highlights
  - Navigation to authentication
- **AuthScreen.tsx**: User registration and login interface
  - Handles user input validation
  - Supabase authentication integration
  - Form switching between signin/signup modes
- **AuthGuard.tsx**: Protected route wrapper
  - Redirects unauthenticated users to login
  - Manages authentication state checking

#### Home & Navigation (`src/components/Home/` & `src/components/Layout/`)
- **HomePage.tsx**: Main dashboard and service selector
  - Central hub for all app features
  - Service cards for palm analysis, kundli, horoscope, chat
  - Quick access to user profile and settings
- **Layout.tsx**: Main app layout wrapper
  - Provides consistent layout structure
  - Integrates header and bottom navigation
- **Header.tsx**: Reusable page header component
  - Back navigation functionality
  - Screen titles and user context
- **BottomNav.tsx**: Main navigation bar
  - Persistent navigation for authenticated users
  - Icon-based navigation between main features

#### Feature Components

##### Palm Analysis (`src/components/Palm/`)
*See [Palm Analysis Documentation](./docs/palm.md) for detailed information*

- **PalmAnalysis.tsx**: Complete palm reading workflow orchestrator
- **ImageUpload.tsx**: Palm image capture and upload handling
- **Questions.tsx**: Questionnaire form for personal details
- **Results.tsx**: Analysis results display and management
- **ProgressIndicator.tsx**: Visual progress tracking


##### Kundli Generation (`src/components/Kundli/`)
- **KundliGenerator.tsx**: Vedic birth chart creation
  - Birth details form (date, time, place)
  - Planetary position calculations
  - Dosha analysis and remedies
  - Integration with astrological databases

##### Horoscope (`src/components/Horoscope/`)
- **DailyHoroscope.tsx**: Daily astrological readings
  - Zodiac sign-based predictions
  - Multiple life aspects (love, career, health, luck)
  - Lucky numbers and colors
  - Personalized based on user profile

##### Chat Consultation (`src/components/Chat/`)
- **SamadhanChat.tsx**: AI-powered astrology chat
  - Real-time conversation interface
  - Contextual astrological advice
  - Chat history and message management
  - Integration with user profile data

##### User Profile (`src/components/Profile/`)
- **ProfilePage.tsx**: User account management
  - Personal information display and editing
  - Birth details management
  - Analysis history and saved readings
  - Account settings and preferences

##### UI Components (`src/components/UI/`)
- **LoadingSpinner.tsx**: Reusable loading indicator
  - Consistent loading states across app
  - Customizable size and styling

### State Management (`src/stores/`)

#### appStore.ts - Zustand Global Store
**Purpose**: Global application state management using Zustand with persistence

**State Structure**:
- `user`: Current user information and authentication status
- `authMode`: Authentication mode (signin/signup)
- `palmAnalyses`: Array of completed palm readings
- `kundlis`: Array of generated birth charts
- `chatHistory`: Array of chat messages
- `isLoading`: Global loading state

**Actions Available**:
- User authentication management
- Data storage and retrieval
- Chat message handling
- Loading state management

**Features**:
- Persistent storage with localStorage
- DevTools integration for debugging
- Optimistic updates and rollback support

### Legacy Context (`src/context/`)

#### AppContext.tsx - Legacy Context (Deprecated)
**Status**: Maintained for backward compatibility
**Migration**: Components are being migrated to use Zustand store

### Type Definitions (`src/types/`)

#### index.ts - Application Type System
**Core Interfaces**:
- `User`: User profile and authentication data
- `PalmAnalysis`: Palm reading results and metadata
- `Kundli`: Birth chart data and interpretations
- `HoroscopeReading`: Daily horoscope structure
- `AppState`: Global application state structure

## 🔄 Component Relationships & Data Flow

### Authentication Flow
1. **SplashScreen** → **AuthScreen** → **Main App**
2. User data flows through AppContext to all components
3. Authentication state determines screen access

### Main App Navigation
- **App.tsx** reads `currentScreen` from AppContext
- **BottomNav** triggers screen changes via AppContext actions
- **Header** provides back navigation functionality

### Feature Interactions
- **HomePage** → Service selection → Feature components
- All features store results in AppContext
- **ProfilePage** displays user data from AppContext

### Data Dependencies
- **PalmAnalysis** requires user authentication
- **KundliGenerator** uses user birth details from profile
- **DailyHoroscope** uses zodiac sign from user data

## 🏗️ Technical Architecture

### Build Configuration
- **vite.config.ts**: Vite build tool configuration
- **tailwind.config.js**: Tailwind CSS customization
- **postcss.config.js**: PostCSS processing setup
- **eslint.config.js**: Code linting rules
- **tsconfig.json**: TypeScript compiler settings
- **package.json**: Dependencies and scripts

### Key Dependencies
- **React 18**: Core framework with hooks and modern features
- **TypeScript**: Type safety and development experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon system
- **React Router DOM**: Client-side routing and navigation
- **Zustand**: Lightweight state management library
- **Supabase**: Backend-as-a-Service (auth, database, storage)
- **@supabase/supabase-js**: Supabase client library

### Styling System
- **Global Styles**: Defined in `index.css`
- **Component Styles**: Tailwind utility classes
- **Custom Classes**: Palm AI-themed color palette
- **Responsive Design**: Mobile-first approach

## 📱 User Experience Flow

### Screen Hierarchy
```
LandingPage
    └── AuthScreen
            └── Main App (Layout.tsx)
                    ├── HomePage (default)
                    ├── PalmAnalysis
                    ├── KundliGenerator  
                    ├── SamadhanChat
                    ├── DailyHoroscope
                    └── ProfilePage
```

### Navigation Patterns
- **React Router**: URL-based routing with protected routes
- **Bottom Navigation**: Primary navigation between main features
- **Header Navigation**: Back button for sub-screens and workflows
- **Authentication Guards**: Route protection for authenticated users

### Data Persistence
- **Supabase Database**: Server-side data storage
- **Local Storage**: Client-side persistence via Zustand
- **Local State**: Component-specific data (forms, temporary UI state)
- **Global State**: Shared data across components via Zustand

## 🔮 Feature Integration Points

### Cross-Component Dependencies
- **User Authentication**: Required by all main features
- **Profile Data**: Used by Kundli and Horoscope components
- **Navigation State**: Managed centrally, affects all screens
- **Loading States**: Coordinated through AppContext

### Current Integration Points
- **Supabase Auth**: User authentication and session management
- **Supabase Database**: Data storage and retrieval
- **Supabase Storage**: Image and file storage
- **Edge Functions**: AI processing and analysis

### Future Extension Points
- **Push Notifications**: Daily horoscope delivery
- **Social Features**: Share readings and charts
- **Payment Integration**: Premium features and consultations
- **Mobile Apps**: React Native implementation
- **Advanced AI**: Enhanced prediction algorithms

## 🗂️ Directory Structure

```
src/
├── components/           # React components
│   ├── Auth/            # Authentication components
│   ├── Chat/            # Chat consultation
│   ├── Home/            # Dashboard and navigation
│   ├── Horoscope/       # Daily horoscope
│   ├── Kundli/          # Birth chart generation
│   ├── Layout/          # Layout components
│   ├── Palm/            # Palm analysis workflow
│   ├── Profile/         # User profile management
│   └── UI/              # Reusable UI components
├── stores/              # Zustand state management
├── hooks/               # Custom React hooks
├── routes/              # React Router configuration
├── services/            # API and business logic
├── integrations/        # Third-party integrations
│   └── supabase/        # Supabase client and types
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── data/                # Static data and configurations
```

This architecture provides a solid foundation for an astrology application with modern React patterns, robust state management, and scalable component design that supports easy maintenance and feature expansion.