# spacecraft-fe

Next.js frontend for SpaceCraft.ai. It provides the user-facing experience for account creation, login, space management, scene generation, theme application, recommendations, and 3D room preview.

The app is a prototype-quality MVP frontend. It is wired to the backend and proves the core loop, but it does not yet have production-grade auth handling, route protection, tests, or a true scene editor.

## Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 14 App Router |
| UI | React 18, TypeScript |
| Styling | Tailwind CSS |
| 3D rendering | Three.js, `@react-three/fiber`, `@react-three/drei` |
| API client | Native `fetch` wrapper in `lib/api.ts` |
| Declared but unused | React Query, Zustand |

## Architecture

```text
spacecraft-fe/
app/
  page.tsx
  login/page.tsx
  register/page.tsx
  spaces/page.tsx
  spaces/[spaceId]/page.tsx
components/
  auth-form.tsx
  scene/scene-editor.tsx
lib/
  api.ts
  types.ts
```

```text
Browser
  |
  v
Next.js pages and components
  |
  v
lib/api.ts
  |
  v
spacecraft-be API
```

The frontend stores JWT tokens in `localStorage`, then attaches the access token as a Bearer token on API calls.

## Environment Variables

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:4000` | Backend API origin. |

Example:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Local Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The backend should be running at `http://localhost:4000` unless `NEXT_PUBLIC_API_URL` points somewhere else.

## Scripts

```bash
npm run dev        # start Next.js dev server
npm run build      # production build
npm run start      # serve production build
npm run lint       # Next lint
npm run typecheck  # TypeScript check
```

There is no frontend `test` script yet.

## Routes

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `spacecraft-fe/app/page.tsx` | Landing page. |
| `/login` | `spacecraft-fe/app/login/page.tsx` | Login form. |
| `/register` | `spacecraft-fe/app/register/page.tsx` | Registration form. |
| `/spaces` | `spacecraft-fe/app/spaces/page.tsx` | Spaces dashboard and create-space form. |
| `/spaces/[spaceId]` | `spacecraft-fe/app/spaces/[spaceId]/page.tsx` | Space studio: images, furniture, themes, scene preview, recommendations. |

## API Contract

The client expects backend responses shaped as:

```ts
interface ApiEnvelope<T> {
  message: string;
  data: T;
}
```

`apiRequest<T>()` unwraps the envelope and returns `data`.

Auth tokens are stored by `storeTokens()`:

```text
localStorage.accessToken
localStorage.refreshToken
```

The refresh token is stored but not used by the current frontend.

## User Flow

```text
Landing page
  -> register or login
  -> tokens saved in localStorage
  -> spaces dashboard
  -> create or open a space
  -> register room image metadata
  -> add furniture notes
  -> generate AI scene
  -> preview scene in WebGL
  -> apply theme
  -> accept or reject recommendations
```

## Scene Preview

`components/scene/scene-editor.tsx` renders a Three.js canvas through React Three Fiber.

What it does today:

- Shows an empty state before a scene exists.
- Renders a floor plane from room dimensions.
- Renders scene objects as procedural boxes.
- Lets users click an object to highlight it.
- Uses orbit controls for camera navigation.

What it does not do yet:

- Drag objects.
- Rotate objects.
- Resize objects.
- Persist object changes back to the backend.
- Render real 3D furniture models.

The component is named `SceneEditor`, but its current behavior is closer to `SceneViewer`.

## Current Limitations

- No route protection. A user can navigate to `/spaces` without a token and will only see API errors.
- No logout UI.
- No refresh-on-401 flow.
- Tokens are stored in `localStorage`.
- No global layout shell, nav, user menu, or account state.
- No frontend tests.
- No error boundaries or loading skeletons.
- The upload form registers asset metadata, but does not upload the binary file from the browser.
- React Query and Zustand are installed but unused.
- `spacecraft-fe/app/spaces/[spaceId]/page.tsx` treats `params` as a Promise, which matches newer async params patterns but should be verified against Next.js 14 behavior.

## Troubleshooting

### API calls fail with 401

Log in again. The app stores the access token in `localStorage`, but it does not refresh expired tokens yet.

### API calls fail with CORS errors

Set the backend `FRONTEND_URL` to the frontend origin:

```bash
FRONTEND_URL=http://localhost:3000
```

Restart the backend after changing it.

### The app calls the wrong backend

Set:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Restart the Next.js dev server.

### Scene is blank

Generate a scene from the space detail page. The backend currently creates mock scenes from furniture inputs or default objects.

## Recommended Next Work

- Add auth middleware or a client guard for protected routes.
- Add logout and token clearing.
- Implement refresh-on-401 or remove refresh-token storage until it exists.
- Rename `SceneEditor` to `SceneViewer`, or add actual transform editing.
- Wire the existing backend object patch endpoint to frontend edit controls.
- Use React Query for server state, or remove the dependency.
- Add frontend tests for auth, spaces, and the space studio flow.
- Add loading, empty, and error states for every API-backed section.

## CEO Read

The frontend proves the product loop. That is valuable. But it is still a thin prototype: no route protection, no real upload, no real editor, no tests.

The next move is not a prettier landing page. The next move is making the workspace reliable enough that a real user can log in, create a scene, leave, come back, and trust what they see.
