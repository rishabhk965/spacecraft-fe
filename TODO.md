# spacecraft-fe TODO

Frontend priorities for turning the current SpaceCraft.ai web app from prototype into a reliable workspace.

## P0 - Fix User Trust and Auth Basics

- [ ] Add protected-route behavior for `/spaces` and `/spaces/[spaceId]`.
  - Why: users without a valid token currently land on API errors instead of a clear login redirect.
  - Start: add a client auth guard or Next middleware.

- [ ] Add logout.
  - Why: tokens are stored in `localStorage`, but the UI gives users no way to clear them.
  - Start: remove `accessToken` and `refreshToken`, then redirect to `/login`.

- [ ] Handle expired access tokens.
  - Why: users currently hit raw 401 errors after token expiry.
  - Start: either implement refresh-on-401 or remove refresh-token storage until backend refresh is real.

- [ ] Improve API error presentation.
  - Why: `apiRequest()` throws raw response text, which creates ugly and confusing UI errors.
  - Start: parse the API envelope when possible and show concise user-facing messages.

## P1 - Make the Core Product Loop Real

- [ ] Implement real browser file upload.
  - Why: the current room image form only registers metadata and does not upload the binary file.
  - Start: use the backend upload URL, PUT the selected file, then call asset completion.

- [ ] Rename `SceneEditor` to `SceneViewer` or add actual editing.
  - Why: the current component supports preview and selection, not drag/rotate/resize/save.
  - Start: if keeping `SceneEditor`, wire object transform controls to `PATCH /spaces/:id/scene/objects/:objectId`.

- [ ] Add loading, empty, and error states to every API-backed section.
  - Cover: spaces list, space detail, themes, scene, recommendations, process action, asset upload.

- [ ] Prevent duplicate actions while requests are in flight.
  - Why: double-clicking “Generate AI scene” or recommendation buttons can trigger duplicate work.
  - Start: add per-action pending state and disable buttons while active.

- [ ] Refresh scene after accepting a recommendation.
  - Why: backend creates a new scene version on accept, but the frontend only updates recommendation status.
  - Start: refetch latest scene after successful accept.

## P2 - Developer and Product Quality

- [ ] Decide whether to use React Query.
  - Why: `@tanstack/react-query` is installed but unused.
  - Options: adopt it for server state or remove the dependency.

- [ ] Decide whether to use Zustand.
  - Why: `zustand` is installed but unused.
  - Options: use it for auth/workspace state or remove it.

- [ ] Verify `params` handling in `spacecraft-fe/app/spaces/[spaceId]/page.tsx`.
  - Why: the page treats `params` as a Promise, which should be checked against the installed Next.js 14 behavior.

- [ ] Add a shared app shell.
  - Why: users need navigation, current account context, and logout.
  - Include: header, link back to spaces, user email/name, logout.

- [ ] Add a frontend `.env.example`.
  - Include: `NEXT_PUBLIC_API_URL`.

## P3 - Testing and Release Confidence

- [ ] Add a frontend test setup.
  - Start: choose Vitest or Jest with React Testing Library.

- [ ] Add tests for `apiRequest()`.
  - Cover: auth header, envelope unwrap, JSON errors, non-JSON errors, missing token.

- [ ] Add tests for auth forms.
  - Cover: login success, register success, failed auth, token storage, redirect.

- [ ] Add tests for the spaces dashboard.
  - Cover: load spaces, create space, error state.

- [ ] Add tests for the space studio flow.
  - Cover: add furniture, register/upload image, process scene, apply theme, accept/reject recommendations.

- [ ] Add build verification to CI once CI exists.
  - Commands: `npm run typecheck`, `npm run lint`, `npm run build`.

## Verification Commands

```bash
npm run typecheck
npm run lint
npm run build
```
