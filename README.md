# Jewelry Management Platform

A comprehensive web application for managing jewelry inventory, vendor relationships, and customer interactions.

## 🏗️ Project Structure

```
src/
├── assets/              # Static assets (images, logos)
├── components/          # Reusable React components
│   ├── admin/          # Admin-specific components
│   ├── filters/        # Product filter components
│   ├── forms/          # Form components
│   └── ui/             # shadcn/ui components
├── config/             # Configuration files
│   └── admin-navigation.tsx  # Admin navigation structure
├── constants/          # Application constants
│   └── routes.ts       # Centralized route definitions
├── hooks/              # Custom React hooks
├── integrations/       # Third-party integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility libraries
├── pages/              # Page components (routes)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main application component
├── index.css           # Global styles and design tokens
└── main.tsx            # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun
- Supabase account 

### Installation

```bash
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm i

# Step 4: Start development server
npm run dev
```

### Environment Variables

Environment variables are automatically managed by Lovable Cloud.

## 🎨 Design System

All colors are HSL values in CSS variables defined in `src/index.css`:

```tsx
// ✅ CORRECT - Use semantic tokens
<div className="bg-primary text-primary-foreground" />

// ❌ WRONG - Don't use direct colors
<div className="bg-yellow-500 text-white" />
```

## 🔐 Security

- **Client-side checks** (guards) are for UI only
- **Server-side security** via RLS policies and edge functions
- Roles: `admin` (full access), `team_member` (limited access)

## 📦 Building

```bash
npm run build
npm run preview
```

## 🚢 Deployment

Via Lovable's integrated deployment:
1. Frontend changes: Click "Update"
2. Backend changes: Deploy automatically

## 🛠️ Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (Lovable Cloud)
- TanStack Query
- React Router v6

## 📝 Code Guidelines

- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts`
- Use TypeScript
- Use semantic tokens
- Write JSDoc comments

## 📚 Resources

- [Lovable Docs](https://docs.lovable.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Edit files**:
- Directly in GitHub
- GitHub Codespaces
- Your preferred IDE
