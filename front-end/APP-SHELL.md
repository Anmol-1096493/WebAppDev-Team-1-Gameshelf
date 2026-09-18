# Shared application shell

`src/components/AppShell.tsx` contains the common GameShelf header, navigation,
main-content area and footer.

## Use it on a page

Wrap the page content and pass the matching page id:

```tsx
<AppShell currentPage="sessions">
  <SessionsPage />
</AppShell>
```

Valid ids are `catalogue`, `collections`, `lending`, `sessions`, `wishlists` and
`profile`. The component adds `aria-current="page"` to the matching navigation
link. Update the `href` values in `navigationItems` when client-side routing is
introduced.

## Accessibility and responsive behaviour

- Native links work with a keyboard without JavaScript event handlers.
- A skip link moves keyboard users directly to the main content.
- Visible focus indicators are provided for all controls and links.
- On narrow screens the full navigation labels stay on one line and the list can
  scroll horizontally.
- From 960px onward the navigation becomes the fixed-width left column shown in
  the wireframes.
