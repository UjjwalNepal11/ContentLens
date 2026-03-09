# Task: Modify Homepage View Dashboard Button

## Plan

### Step 1: Add Clerk authentication imports to page.tsx

- Import `useAuth` and `useUser` from `@clerk/nextjs"

### Step 2: Add authentication state

- Use `useAuth` hook to get `isLoaded` and `userId`
- Use `useUser` hook to get `user` info

### Step 3: Modify hero section button logic

- For NOT signed-in users (no userId): Show "Sign In" button that redirects to `/sign-in`
- For signed-in users (has userId): Show "View Dashboard" button that redirects to `/dashboard`

### Step 4: Remove unused preview modal code

- Remove `showDashboardPreview` state
- Remove the preview modal component that shows when `showDashboardPreview` is true

## Status: ✅ COMPLETED
