# Portal Layout and Features Guide

This document describes the common layout patterns, features, and components used across the PCC SMS portals. Use this guide when creating new dashboards or pages.

## Common Layout Structure

### Page Container
```tsx
// Standard page container (most pages)
<div className="min-h-screen">
  <div className="p-4 max-w-4xl mx-auto space-y-4">
    {/* Content */}
  </div>
</div>

// Wide dashboard container (main dashboards)
<div className="p-5 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
  {/* Content */}
</div>
```

### Page Header Pattern
```tsx
<div className="mb-6">
  <h1 className="text-lg font-bold text-foreground">Page Title</h1>
  <p className="text-sm text-muted-foreground">Page description</p>
</div>

// Enhanced header with role badge and time
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold text-foreground tracking-tight">
      {greeting}, {user?.fullName}
    </h1>
    <div className="flex items-center gap-4 mt-1">
      <Badge className="bg-[#123B70]/10 text-[#123B70] border-[#123B70]/20">
        Role Name
      </Badge>
    </div>
  </div>
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Clock className="h-4 w-4" />
    <span>{new Date().toLocaleString()}</span>
  </div>
</div>
```

## Card Types and Patterns

### 1. Stat Card (Compact)
**Used in:** Reports, My Activity, Visitor Exit
```tsx
<Card>
  <CardContent className="pt-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Label</p>
        <p className="text-2xl font-bold text-[#123B70] mt-1">Value</p>
      </div>
      <div className="h-8 w-8 rounded-full bg-[#123B70]/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-[#123B70]" />
      </div>
    </div>
  </CardContent>
</Card>
```

### 2. Stat Card with Progress Bar
**Used in:** Main Dashboard, Supervisor Dashboard
```tsx
<Card className="group hover:shadow-lg transition-all duration-300 border-blue-200 dark:border-blue-800">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
    <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Label</CardTitle>
    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="flex items-baseline gap-2">
      <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">Value</div>
      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">unit</div>
    </div>
    <div className="mt-2 flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">target: 50</span>
    </div>
  </CardContent>
</Card>
```

### 3. Action Card (Clickable)
**Used in:** Guard Dashboard (Sector Head)
```tsx
<Card 
  className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-[#123B70]/20 hover:border-[#123B70]"
  onClick={() => router.push('/path')}
>
  <CardContent className="pt-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-xl font-bold text-[#123B70]">Title</h3>
        <p className="text-sm text-muted-foreground mt-1">Description</p>
      </div>
      <ArrowRight className="h-8 w-8 text-[#123B70]" />
    </div>
  </CardContent>
</Card>
```

### 4. Content Card with Header
**Used in:** Reports, Active Visitors, My Activity
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-base">
      <Icon className="h-4 w-4" />
      Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### 5. List Item Card
**Used in:** Active Visitors, My Activity
```tsx
<Card className="hover:shadow-md transition-shadow">
  <CardContent className="pt-4">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-[#123B70]/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-[#123B70]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Title</h3>
          <p className="text-xs text-gray-500">Subtitle</p>
        </div>
      </div>
      <Badge className="bg-[#123B70]/10 text-[#123B70] border-[#123B70]/20 text-xs">
        Status
      </Badge>
    </div>
  </CardContent>
</Card>
```

### 6. Detail Card (Highlighted Pass Number)
**Used in:** Visitor Exit, Active Visitors
```tsx
<Card>
  <CardContent className="pt-4 space-y-3">
    <div className="bg-[#123B70] text-white rounded-lg p-3">
      <p className="text-xs text-blue-200 mb-1">Pass Number</p>
      <p className="text-xl font-bold tracking-wider">PCC-XXXXXX</p>
    </div>
    
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 text-gray-400 mt-0.5" />
        <div>
          <p className="text-xs text-gray-500">Label</p>
          <p className="text-sm font-semibold text-gray-900">Value</p>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

## Grid Layout Patterns

### 4-Column Stats Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Stat cards */}
</div>
```

### 3-Column Stats Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Stat cards */}
</div>
```

### Compact 4-Column Grid
```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
  {/* Compact stat cards */}
</div>
```

### 2-Column Action Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
  {/* Action cards */}
</div>
```

### Mixed Grid (Charts)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <Card> {/* 1/3 width */} </Card>
  <div className="lg:col-span-2"> {/* 2/3 width */} </div>
</div>
```

## Common Features

### 1. Authentication Check
```tsx
const checkAuth = async () => {
  try {
    const response = await fetch('/api/auth/me')
    if (!response.ok) {
      router.push('/login')
      return
    }
    const data = await response.json()
    // Role-based access control
    if (data.user.role !== 'expected_role') {
      router.push('/dashboard')
      return
    }
    setUser({ 
      role: data.user.role, 
      fullName: data.user.fullName || data.user.email?.split('@')[0] || 'Default Name'
    })
  } catch (error) {
    console.error('Auth check failed:', error)
    router.push('/login')
  } finally {
    setLoading(false)
  }
}
```

### 2. Loading State
```tsx
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#123B70] mx-auto"></div>
        <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
```

### 3. Skeleton Loading (Dashboards)
```tsx
if (loading) {
  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-[220px] rounded-2xl" />
        <Skeleton className="h-[220px] rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[160px] rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
```

### 4. Search Functionality
```tsx
const [searchQuery, setSearchQuery] = useState('')
const [filteredItems, setFilteredItems] = useState([])

useEffect(() => {
  if (searchQuery) {
    const filtered = items.filter((item) =>
      item.field1?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.field2?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredItems(filtered)
  } else {
    setFilteredItems(items)
  }
}, [searchQuery, items])

// Search input
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
  <Input
    placeholder="Search by..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="pl-9 h-9 text-sm"
  />
</div>
```

### 5. Empty State
```tsx
{items.length === 0 ? (
  <Card>
    <CardContent className="pt-6 text-center py-12">
      <Icon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">
        No items found
      </p>
    </CardContent>
  </Card>
) : (
  <div className="space-y-3">
    {/* List items */}
  </div>
)}
```

### 6. Filter Buttons
```tsx
<div className="flex gap-2">
  <Button
    variant={filter === 'all' ? 'default' : 'outline'}
    onClick={() => setFilter('all')}
    className="flex-1 h-9 text-xs"
  >
    All
  </Button>
  <Button
    variant={filter === 'option1' ? 'default' : 'outline'}
    onClick={() => setFilter('option1')}
    className="flex-1 h-9 text-xs"
  >
    Option 1
  </Button>
</div>
```

### 7. Quick Actions Grid
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Icon className="h-5 w-5" />
      Quick Actions
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Button
        variant="outline"
        className="h-auto flex-col gap-2 py-4"
        onClick={() => router.push('/path')}
      >
        <Icon className="h-5 w-5" />
        <span className="text-sm">Action Name</span>
      </Button>
    </div>
  </CardContent>
</Card>
```

## Form Patterns

### Standard Form with Labels
```tsx
<form onSubmit={handleSubmit} className="space-y-3">
  <div>
    <Label htmlFor="field" className="flex items-center gap-2 mb-1.5 text-xs">
      <Icon className="w-3.5 h-3.5" />
      Field Label *
    </Label>
    <Input
      id="field"
      value={formData.field}
      onChange={(e) => setFormData({ ...formData, field: e.target.value })}
      placeholder="Placeholder"
      className="h-9 text-sm"
      required
    />
  </div>
  
  <Button
    type="submit"
    disabled={submitting}
    className="w-full bg-[#123B70] hover:bg-[#0d2d52] h-10 text-sm"
  >
    {submitting ? 'PROCESSING...' : 'SUBMIT'}
  </Button>
</form>
```

### Error Display
```tsx
{error && (
  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-lg flex items-start gap-2 text-xs">
    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
    <span>{error}</span>
  </div>
)}
```

### Info Box
```tsx
<div className="bg-muted/50 rounded-lg p-3">
  <p className="text-xs text-muted-foreground">
    <span className="font-medium">Label:</span> Value
  </p>
</div>
```

## Color Scheme

### Primary Color
- **Primary**: `#123B70` (deep blue)
- **Primary Hover**: `#0d2d52` (darker blue)
- **Primary Light**: `bg-[#123B70]/10` (10% opacity)
- **Primary Border**: `border-[#123B70]/20` (20% opacity)

### Status Colors
- **Success/Entry**: Green (`bg-green-100`, `text-green-600`, `border-green-200`)
- **Info/Exit**: Blue (`bg-blue-100`, `text-blue-600`, `border-blue-200`)
- **Warning/Alert**: Amber (`bg-amber-100`, `text-amber-600`, `border-amber-200`)
- **Error/Danger**: Red (`bg-red-100`, `text-red-600`, `border-red-200`)
- **Neutral**: Gray (`bg-gray-100`, `text-gray-600`, `border-gray-200`)

## Typography Scale

### Headings
- **Page Title**: `text-lg font-bold text-foreground`
- **Dashboard Title**: `text-2xl font-bold text-foreground tracking-tight`
- **Card Title**: `text-sm font-medium` or `text-base font-semibold`

### Body Text
- **Label**: `text-xs font-medium text-muted-foreground`
- **Value**: `text-sm font-semibold text-gray-900`
- **Description**: `text-sm text-muted-foreground`

### Numbers
- **Large Stat**: `text-3xl font-bold text-[#123B70]`
- **Medium Stat**: `text-2xl font-bold text-[#123B70]`
- **Small Stat**: `text-xl font-bold text-[#123B70]`

## Button Styles

### Primary Button
```tsx
<Button className="bg-[#123B70] hover:bg-[#0d2d52] h-10 text-sm">
  Button Text
</Button>
```

### Small Primary Button
```tsx
<Button className="bg-[#123B70] hover:bg-[#0d2d52] h-9 text-xs">
  Button Text
</Button>
```

### Outline Button
```tsx
<Button variant="outline" className="h-9 text-sm">
  Button Text
</Button>
```

### Ghost Button
```tsx
<Button variant="ghost" size="sm" className="text-[#123B70]">
  Button Text
</Button>
```

## Badge Styles

### Role Badge
```tsx
<Badge className="bg-[#123B70]/10 text-[#123B70] border-[#123B70]/20">
  Role
</Badge>
```

### Status Badges
```tsx
// Entry/Success
<Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
  Entry
</Badge>

// Exit/Info
<Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
  Exit
</Badge>

// Warning
<Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
  Action Required
</Badge>
```

## Icon Circle Sizes

### Small (32px)
```tsx
<div className="h-8 w-8 rounded-full bg-[#123B70]/10 flex items-center justify-center">
  <Icon className="h-4 w-4 text-[#123B70]" />
</div>
```

### Medium (40px)
```tsx
<div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
  <Icon className="h-5 w-5 text-blue-600" />
</div>
```

### Large (48px)
```tsx
<div className="h-12 w-12 rounded-full bg-[#123B70]/10 flex items-center justify-center">
  <Icon className="h-6 w-6 text-[#123B70]" />
</div>
```

## Portal-Specific Features

### Guard Dashboard (Sector Head)
- **Purpose**: Quick access to visitor entry/exit
- **Key Features**:
  - Personal greeting with role badge
  - 4 stat cards (entries, exits, on site, visitors today)
  - 2 large action cards (visitor entry, visitor exit)
  - Active visitors preview card
- **Layout**: Wide container, 4-column grid, 2-column action grid

### Supervisor Dashboard
- **Purpose**: Shift management and oversight
- **Key Features**:
  - Staff ID display
  - 6 stat cards (officers, attendance, incidents, visitors, vehicles, reports)
  - Quick actions grid (4 buttons)
  - Officers status list
  - Recent activity cards
- **Layout**: Wide container, 3-column grid, mixed layouts

### Main Dashboard (Security Officer)
- **Purpose**: High-level overview
- **Key Features**:
  - Shift timer and weather widgets
  - 4 color-coded stat cards with progress bars
  - Live activity feed
  - Charts (donut + bar chart)
- **Layout**: Wide container, 4-column grid, chart grid

### Visitor Entry
- **Purpose**: Register new visitors
- **Key Features**:
  - Multi-step form with validation
  - Visitor type toggle (organisation/individual)
  - Purpose dropdown
  - Success confirmation with pass number
- **Layout**: Centered form, max-w-2xl

### Visitor Exit
- **Purpose**: Record visitor departures
- **Key Features**:
  - Search by pass number
  - Visitor details confirmation
  - Exit recording with guard info
  - Success confirmation
- **Layout**: Centered form, max-w-2xl

### Active Visitors
- **Purpose**: View current visitors on site
- **Key Features**:
  - Search functionality
  - Visitor cards with pass numbers
  - Duration calculation
  - Entry guard info
- **Layout**: List view, max-w-4xl

### Reports
- **Purpose**: Analytics and statistics
- **Key Features**:
  - Date range filter
  - Export functionality
  - 4 compact stat cards
  - Charts by purpose and day
- **Layout**: Compact grid, max-w-4xl

### My Activity
- **Purpose**: Personal activity history
- **Key Features**:
  - Filter buttons (all/entry/exit)
  - Activity list with badges
  - Timestamp formatting
- **Layout**: Compact grid, list view

## Responsive Design

### Breakpoints
- **Mobile**: `p-4`, single column
- **Tablet**: `sm:p-6`, 2 columns
- **Desktop**: `lg:p-8`, 3-4 columns

### Common Responsive Patterns
```tsx
// Grid columns
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4

// Padding
p-4 sm:p-6 lg:p-8

// Text sizes
text-sm sm:text-base lg:text-lg

// Button sizes
h-9 sm:h-10
```

## Data Fetching Patterns

### Standard Fetch
```tsx
const loadData = async () => {
  try {
    const response = await fetch('/api/endpoint')
    if (response.ok) {
      const data = await response.json()
      setData(data)
    }
  } catch (error) {
    console.error('Failed to load:', error)
  }
}
```

### Auto-refresh (Dashboards)
```tsx
useEffect(() => {
  loadMetrics()
  const interval = setInterval(loadMetrics, 30000) // 30 seconds
  return () => clearInterval(interval)
}, [])
```

## Common Icons Used
- `Users` - People/visitors
- `Car` - Vehicles
- `AlertTriangle` - Incidents/alerts
- `ShieldCheck` - Security/actions
- `Clock` - Time/attendance
- `FileText` - Reports/documents
- `Activity` - Activity feed
- `UserPlus` - New entries
- `LogOut` - Exits
- `Search` - Search functionality
- `MapPin` - Locations
- `Building` - Organisations
- `Phone` - Contact info
- `CheckCircle2` - Success states
- `ArrowRight` - Navigation/actions

## Notes for New Dashboards

1. **Always include authentication check** with role-based access control
2. **Use consistent loading states** - spinner for simple pages, skeletons for dashboards
3. **Follow the color scheme** - use `#123B70` as primary
4. **Maintain responsive design** - test on mobile, tablet, desktop
5. **Include error handling** - show user-friendly error messages
6. **Use proper spacing** - `space-y-4` or `space-y-6` for vertical rhythm
7. **Keep card heights consistent** - use `h-9`, `h-10` for inputs/buttons
8. **Add hover states** - `hover:shadow-lg`, `transition-shadow` for cards
9. **Use badges for status** - color-coded for quick scanning
10. **Include empty states** - helpful message when no data exists
