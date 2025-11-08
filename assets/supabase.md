# Supabase Integration - Web Frontend

This frontend uses Supabase for authentication via magic link (OTP).

## Environment Variables

Configure the following variables in `web_frontend/.env`:

- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY
- REACT_APP_FRONTEND_URL (optional, used for emailRedirectTo; defaults to window.location.origin)

As a convenience, the client also supports:
- SUPABASE_URL
- SUPABASE_KEY

These will be mirrored if the React-safe variables are unavailable, but it is recommended to set the React-safe variables.

## Redirect URL

Magic link redirects to:
- `${REACT_APP_FRONTEND_URL || window.location.origin}/`

Ensure that this URL is added to the Supabase project's Auth > URL Configuration > Redirect URLs.

## Public API

- AuthProvider: React context provider exposing `{ user, session, loading, signInWithEmail(email), signOut() }`
- getSupabaseClient(): returns the configured Supabase client singleton

## Protected Routes

- `/reports` and `/history` require authentication.
- `/dashboard` is public and shows basic user info if logged in.

Theme: The UI adheres to the Ocean Professional theme established in the app.
