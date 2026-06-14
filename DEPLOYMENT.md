## Deployment Checklist

- [ ] Create Vercel project: `vercel`
- [ ] Create Vercel KV database
- [ ] Link KV to project
- [ ] Set environment variables (KV_REST_API_URL, KV_REST_API_TOKEN)
- [ ] Seed initial songs: `npm run seed`
- [ ] Deploy: `git push origin main`
- [ ] Test public page: https://nin.vercel.app
- [ ] Test admin page: https://nin.vercel.app/admin
- [ ] Add auth to admin route (optional)

## Features to Add (Future)

- [ ] Authentication for admin interface
- [ ] Edit/delete individual rankings
- [ ] Drag-and-drop reordering
- [ ] Undo/redo for rankings
- [ ] CSV export of final rankings
- [ ] Halo number filtering
- [ ] Year range filtering
- [ ] Search songs by name/album
- [ ] Webhook notifications (Discord alert when new rank added)
- [ ] History timeline of stream rankings
