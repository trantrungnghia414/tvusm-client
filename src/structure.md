src/
  app/
    (admin)/          # Admin routes
      layout.tsx      # Admin layout
      dashboard/
        page.tsx
      fields/
        page.tsx
      devices/
        page.tsx
      bookings/
        page.tsx
      events/
        page.tsx
      news/
        page.tsx
      users/
        page.tsx
      statistics/
        page.tsx
      settings/
        page.tsx
    (auth)/           # Auth routes
      login/
        page.tsx
      register/
        page.tsx
    (user)/           # User routes
      layout.tsx      # User layout
      profile/
        page.tsx
      bookings/
        page.tsx
      events/
        page.tsx
    layout.tsx        # Root layout
    page.tsx          # Home page
  components/
    admin/            # Admin components
    user/             # User components
    shared/           # Shared components
  lib/
    auth.ts          # Authentication utilities
    api.ts           # API utilities
  styles/
    globals.css