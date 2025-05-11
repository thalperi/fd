# Nuxt 3 Authentication Setup with @sidebase/nuxt-auth, GitHub, and Supabase

This document outlines the steps to implement authentication in a Nuxt 3 application using `@sidebase/nuxt-auth` as the core module, with GitHub as an OAuth provider and Supabase for email/password authentication (via a Credentials provider). This plan is based on research from official documentation and community tutorials.

## Core Principles:
- `@sidebase/nuxt-auth` will manage authentication sessions and provide the primary API for sign-in/sign-out operations.
- GitHub will be integrated as a direct OAuth provider.
- Supabase will be used for its user database and to handle email/password credential verification, integrated via a `CredentialsProvider`.

## I. Initial Setup & Configuration

### 1. Installation
Install the necessary packages:
```bash
npm install @sidebase/nuxt-auth next-auth @supabase/supabase-js
```
*   `@sidebase/nuxt-auth`: The main Nuxt authentication module.
*   `next-auth`: A core dependency for `@sidebase/nuxt-auth`, providing provider logic.
*   `@supabase/supabase-js`: To interact with Supabase for the credentials provider.

### 2. Environment Variables
Create or update your `.env` file with the following variables. These are essential for the authentication providers and session management.

```env
# @sidebase/nuxt-auth
NUXT_AUTH_SECRET="YOUR_STRONG_SECRET_HERE" # Generate a strong random string (e.g., openssl rand -hex 32)

# GitHub OAuth Provider
GITHUB_CLIENT_ID="YOUR_GITHUB_CLIENT_ID"
GITHUB_CLIENT_SECRET="YOUR_GITHUB_CLIENT_SECRET"

# Supabase Credentials Provider
SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
SUPABASE_KEY="YOUR_SUPABASE_ANON_KEY" # Or service_role key if appropriate for server-side auth logic, consult Supabase docs. For signInWithPassword, anon key is usually fine.
```
**Action:**
- [ ] Generate a strong `NUXT_AUTH_SECRET`.
- [ ] Create a GitHub OAuth App and obtain `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
    - Set the callback URL in GitHub to: `http://localhost:3000/api/auth/callback/github` (adjust port if necessary).
- [ ] Ensure `SUPABASE_URL` and `SUPABASE_KEY` for your Supabase project are available.

### 3. Server API Route for Authentication
`@sidebase/nuxt-auth` handles authentication requests through a catch-all API route.

**Action:**
- [ ] Create the file `server/api/auth/[...].ts`.
- [ ] Populate `server/api/auth/[...].ts` with the `NuxtAuthHandler` and provider configurations (see details in sections II and III).

```typescript
// server/api/auth/[...].ts
import { NuxtAuthHandler } from '#auth'; // '#auth' is an alias provided by @sidebase/nuxt-auth
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

export default NuxtAuthHandler({
  secret: process.env.NUXT_AUTH_SECRET,
  providers: [
    // GitHub OAuth Provider
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    // Supabase Email/Password Credentials Provider
    CredentialsProvider({
      name: 'Supabase', // Name to display on sign-in form
      id: 'supabase-credentials', // Unique ID for this provider
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Record<"email" | "password", string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Credentials provider: Missing email or password');
          return null;
        }
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
          console.error('Supabase URL or Key not configured for CredentialsProvider');
          return null;
        }

        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data?.user) {
          console.error('Supabase sign-in error:', error?.message);
          // Consider throwing an error that NextAuth.js can display to the user
          // For now, returning null indicates failure.
          return null;
        }

        // If authentication is successful, return a user object.
        // This object will be stored in the JWT.
        // Ensure it has at least an `id` or `email`.
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email, // Example: use full_name or fallback to email
          // Add any other user properties you want in the session token
        };
      },
    }),
  ],
  // Optional: Add callbacks for session, jwt, etc. if needed for customization
  // callbacks: {
  //   jwt: async ({ token, user }) => {
  //     if (user) {
  //       token.id = user.id; // Persist user id to token
  //     }
  //     return token;
  //   },
  //   session: async ({ session, token }) => {
  //     if (session.user) {
  //       session.user.id = token.id as string; // Persist user id to session
  //     }
  //     return session;
  //   },
  // },
});
```

## II. GitHub OAuth Provider Integration

This involves configuring the GitHub provider within the `NuxtAuthHandler`.

**Reference:** Official `@sidebase/nuxt-auth` documentation and NextAuth.js documentation for `GithubProvider`.

**Action:**
- [ ] Ensure `GithubProvider` is imported from `next-auth/providers/github` in `server/api/auth/[...].ts`.
- [ ] Add `GithubProvider` to the `providers` array in `NuxtAuthHandler`, configured with `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from environment variables.
- [ ] Verify GitHub OAuth App callback URL is `[YOUR_APP_URL]/api/auth/callback/github`.

## III. Supabase Credentials Provider Integration

This involves setting up a `CredentialsProvider` to authenticate users against your Supabase database using their email and password.

**Reference:** Official `@sidebase/nuxt-auth` documentation and NextAuth.js documentation for `CredentialsProvider`. Supabase JS client documentation for `signInWithPassword`.

**Actions:**
- [ ] Ensure `CredentialsProvider` is imported from `next-auth/providers/credentials` in `server/api/auth/[...].ts`.
- [ ] Add `CredentialsProvider` to the `providers` array.
    - Configure `name` (e.g., 'Supabase') and `id` (e.g., 'supabase-credentials').
    - Define the `credentials` object (for email and password fields).
    - Implement the `authorize` async function:
        - [ ] Initialize Supabase client using `createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)`.
        - [ ] Call `supabase.auth.signInWithPassword()` with the provided email and password.
        - [ ] Handle errors from Supabase.
        - [ ] If successful, return a user object (e.g., `{ id: user.id, email: user.email, name: user.user_metadata?.name }`). This object's shape determines what's available in the session.
        - [ ] If authentication fails, return `null` or throw an error.

## IV. Client-Side Implementation

Using `@sidebase/nuxt-auth` composables and methods to manage authentication in your Vue components and pages.

**Reference:** `@sidebase/nuxt-auth` documentation for client-side usage.

**Actions:**
- [ ] **Login UI:** Create Vue components for login forms/buttons.
    - For GitHub: Implement a button that calls `signIn('github')`.
    - For Supabase Credentials: Implement a form that collects email/password and calls `signIn('supabase-credentials', { email: '...', password: '...' })`.
- [ ] **Logout:** Implement a button that calls `signOut()`.
- [ ] **Session Management:** Use `useAuth()` composable to get session status (`status.value`), user data (`data.value`), and methods like `signIn`, `signOut`.
    ```vue
    <script setup lang="ts">
    const { status, data: session, signIn, signOut } = useAuth();
    </script>
    ```
- [ ] **Route Protection:**
    - Use Nuxt middleware to protect pages based on authentication status.
    ```typescript
    // Example: middleware/auth.ts
    export default defineNuxtRouteMiddleware((to, from) => {
      const { status } = useAuth();
      if (status.value === 'unauthenticated' && to.path !== '/login') { // Adjust paths as needed
        return navigateTo('/login');
      }
    });
    ```
    - Apply middleware to specific pages or globally in `nuxt.config.ts`.

## V. Testing and Refinement
- [ ] Thoroughly test both GitHub OAuth flow and Supabase email/password login.
- [ ] Test logout functionality.
- [ ] Test route protection for authenticated and unauthenticated users.
- [ ] Review error handling and user feedback mechanisms.

This document will be updated as implementation progresses.
