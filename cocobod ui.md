# UI Update — Admin Dashboard Matching SMS Design System

This replaces the admin-side color/typography/card direction from the earlier design system with your existing SMS dashboard style. The public-facing pages (landing, register, confirmation) keep the forest/gold ceremonial look from before, that's a different audience. This section covers only `/admin/*` pages: dashboard, check-in, registrations, attendance, settings.

If shadcn/ui isn't already installed in this project, install it first (`Card`, `CardHeader`, `CardContent`, `CardTitle`, `Badge`, `Button`, `Input`, `Label`). All admin components below are built from these primitives, not custom-styled divs.

## Color palette (admin only)

```
--primary:        #123B70   /* deep blue, replaces forest/forest-deep everywhere in admin */
--primary-hover:  #0d2d52
--primary-light:  #123B70 at 10% opacity   → bg-[#123B70]/10
--primary-border: #123B70 at 20% opacity   → border-[#123B70]/20
```

Use shadcn's default `text-foreground`, `text-muted-foreground`, and `text-destructive` tokens for everything else, don't introduce the cream/ink/brick tokens from the public design system into admin pages.

## Typography (admin only)

No custom font loading for admin, use the existing default sans font already configured in the project (whatever shadcn/ui is set up with). Drop Fraunces and IBM Plex Mono from admin entirely, those stay reserved for the public pages.

```
Page header:     text-lg font-bold text-foreground
Page subtext:    text-sm text-muted-foreground
Card label:      text-xs font-medium text-muted-foreground
Card value:      text-2xl font-bold text-[#123B70]
Dashboard value: text-3xl font-bold text-[#123B70]
```

## Layout container

```tsx
<div className="p-5 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
```

Keep the left sidebar navigation structure already specified (Dashboard, Check-in, Registrations, Attendance, Settings, Log out), but restyle it: white or light-gray background instead of the dark forest-deep panel, active link gets `bg-[#123B70]/10 text-[#123B70]` instead of a gold left border, inactive links `text-muted-foreground`. Collapse to a drawer on mobile as before.

## Dashboard stat cards

Replace the current stat card styling with:

```tsx
<Card>
  <CardContent className="pt-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Total Registered</p>
        <p className="text-3xl font-bold text-[#123B70] mt-2">248</p>
      </div>
      <div className="h-12 w-12 rounded-full bg-[#123B70]/10 flex items-center justify-center">
        <Users className="h-6 w-6 text-[#123B70]" />
      </div>
    </div>
  </CardContent>
</Card>
```

Use this for Total Registered, Checked In, Not Yet Arrived, Attendance Percentage. Pick a distinct lucide icon per card (Users, CheckCircle, Clock, Percent or similar). Grid:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
```

Reuse the same stat card on the Attendance page (smaller variant is fine there, `pt-4`, `text-2xl`, `h-8 w-8` icon circle, per the compact stat card pattern).

## Check-in verify card

Replace the gold-accent-border card from the earlier spec with a standard `Card` + `CardHeader`/`CardContent`:

```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-base">
      <UserCheck className="h-4 w-4" />
      Participant Found
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-2">
    {/* key-value rows: label text-xs text-muted-foreground, value text-sm font-semibold */}
  </CardContent>
</Card>
```

Check-in status uses a `Badge`, not the pill component from the earlier spec:

```tsx
// Not checked in
<Badge className="bg-[#123B70]/10 text-[#123B70] border-[#123B70]/20 text-xs">
  Not Checked In
</Badge>

// Checked in
<Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
  Checked In
</Badge>
```

"Confirm & Check In" button:

```tsx
<Button className="bg-[#123B70] hover:bg-[#0d2d52] h-10 text-sm w-full">
  Confirm & Check In
</Button>
```

## Search input

```tsx
<div>
  <Label htmlFor="search" className="flex items-center gap-2 mb-1.5 text-xs">
    <Search className="w-3.5 h-3.5" />
    Registration Code or Name
  </Label>
  <Input id="search" className="h-9 text-sm" />
</div>
```

## Registrations and Attendance tables

Status column uses the same `Badge` treatment as the verify card (blue-tinted "Not Checked In", green "Checked In"). Add a second badge style for source:

```tsx
// Online
<Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Online</Badge>
// Walk-in
<Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Walk-in</Badge>
```

Wrap each table in a plain `Card` with a `CardHeader` title ("All Registrations" / "Attendance") rather than a bare table on the page background.

## Walk-in modal / Settings forms

Use the form element pattern consistently:

```tsx
<div>
  <Label htmlFor="fullName" className="flex items-center gap-2 mb-1.5 text-xs">
    Full Name *
  </Label>
  <Input id="fullName" className="h-9 text-sm" />
</div>
```

Primary submit button same `bg-[#123B70] hover:bg-[#0d2d52]` treatment. Secondary/cancel buttons use `variant="outline"`.

## Error and loading states

Error message block:

```tsx
<div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-lg flex items-start gap-2 text-xs">
  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
  <span>Registration code not found.</span>
</div>
```

Loading state (search, check-in, CSV export):

```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#123B70] mx-auto" />
```

## Icon circles (reused across stat cards and list items)

```tsx
// Small (32px) — list item cards
<div className="h-8 w-8 rounded-full bg-[#123B70]/10 flex items-center justify-center">
  <Icon className="h-4 w-4 text-[#123B70]" />
</div>

// Medium (48px) — dashboard stat cards
<div className="h-12 w-12 rounded-full bg-[#123B70]/10 flex items-center justify-center">
  <Icon className="h-6 w-6 text-[#123B70]" />
</div>
```

## What stays from the earlier spec

- Sidebar navigation structure and mobile collapse behavior
- Admin/public layout separation (admin is dense and functional, public stays ceremonial)
- All backend logic, routes, and data model requirements from the functional spec are unchanged

## What to drop from the earlier admin styling

- forest / forest-deep / gold-soft / sage tokens anywhere in `/admin/*`
- Fraunces and IBM Plex Mono in admin
- The gold-left-border verify card and custom pill badge, replaced by shadcn `Card` and `Badge` above
- Sharp `rounded-sm` buttons in admin, use shadcn's default `Button` rounding instead

## Acceptance check

Admin pages should look and feel like the SMS dashboard: `#123B70` as the only brand accent, shadcn `Card`/`Badge`/`Button` components throughout, icon-circle stat cards, no serif type anywhere in `/admin/*`. Public pages (landing, register, confirmation) are unaffected by this update and keep the forest/gold credential design.
