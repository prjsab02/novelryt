# FIREBASE_SETUP.md — enable real accounts + cloud sync

> Do this when you want logins and your work to sync across devices. Until you
> finish it, the app keeps working in local-first mode. ~10 minutes.

## A. Create the Firebase project
1. Go to https://console.firebase.google.com → sign in with Google.
2. Click **Create a project** (or **Add project**).
3. Name it `novelryt` → **Continue**. You can **disable Google Analytics** → **Create project** → **Continue**.

## B. Add a Web app
1. On the project home, click the **`</>`** (Web) icon.
2. App nickname: `novelryt-web` → **Register app**.
3. You'll see a `firebaseConfig` block. **Keep this page open** — you need these 6 values:
   `apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId`.

## C. Turn on Authentication (Google sign-in)
1. Left menu → **Build → Authentication** → **Get started**.
2. **Sign-in method** tab → **Add new provider** → **Google** → toggle **Enable**
   → choose a support email → **Save**. (Email/password is intentionally not used.)

## D. Turn on Firestore (the database)
1. Left menu → **Build → Firestore Database** → **Create database**.
2. Choose a location near you → **Next**.
3. Start in **production mode** → **Create**.
4. Open the **Rules** tab, replace everything with the rules below, click **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Each user can read/write only their own data.
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## E. Give the values to Cloudflare (so the live site uses Firebase)
1. Cloudflare dashboard → **Workers & Pages** → your `novelryt` project →
   **Settings** → **Environment variables** → **Production**.
2. Add these six variables (names exactly as shown; values from step B):

```
VITE_FIREBASE_API_KEY              = <apiKey>
VITE_FIREBASE_AUTH_DOMAIN          = <authDomain>
VITE_FIREBASE_PROJECT_ID           = <projectId>
VITE_FIREBASE_STORAGE_BUCKET       = <storageBucket>
VITE_FIREBASE_MESSAGING_SENDER_ID  = <messagingSenderId>
VITE_FIREBASE_APP_ID               = <appId>
```

3. Also add (if not already there): `NODE_VERSION = 20`.
4. Go to **Deployments** → **Retry deployment** (or just push any change) so the
   site rebuilds with the new values.

## F. Authorize your live domain (for Google sign-in)
1. Firebase Console → **Authentication → Settings → Authorized domains** →
   **Add domain** → enter your `novelryt.pages.dev` domain.

## Done
Reload your live site. The login screen now shows **Continue with Google**, and
everything you write saves to the cloud and syncs across devices. No code changes
needed — the app detects the config automatically.

> Note: existing work created in local-first mode lives only in that browser and
> is not auto-migrated. You can **Export → JSON backup** from a project (local mode)
> and **Import** it after signing in (cloud mode) to carry it over.
