# Mobile UI Implementation Guide

This guide shows how to use the new mobile UI components to enhance the COCOBOD SECMS mobile experience.

## Components Available

### 1. MobileCardView
Transforms tables into mobile-friendly card views on small screens.

```tsx
import { MobileCardView } from '@/components/mobile'

// Define columns
const columns = [
  {
    key: 'itemName',
    label: 'Item Name',
    render: (item) => item.itemName
  },
  {
    key: 'available',
    label: 'Available',
    render: (item) => item.availableQuantity
  },
  {
    key: 'status',
    label: 'Status',
    render: (item) => <StatusBadge status={item.status} />
  }
]

// Use in your component
<div>
  {/* Desktop table */}
  <Table className="hidden lg:block">
    {/* Table content */}
  </Table>

  {/* Mobile card view */}
  <MobileCardView data={equipment} columns={columns} />
</div>
```

### 2. MobileSearchBar
Expandable search bar with full-screen mode for mobile.

```tsx
import { MobileSearchBar } from '@/components/mobile'

function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div>
      <MobileSearchBar
        onSearch={setSearchQuery}
        placeholder="Search equipment..."
      />
      {/* Filtered results */}
    </div>
  )
}
```

### 3. MobileActionSheet
Bottom sheet action menu for mobile.

```tsx
import { MobileActionSheet } from '@/components/mobile'
import { Edit, Trash2, Eye } from 'lucide-react'

function EquipmentRow({ equipment }) {
  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: () => router.push(`/inventory/${equipment.id}`)
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: () => openEditDialog(equipment)
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: () => deleteEquipment(equipment.id)
    }
  ]

  return (
    <MobileActionSheet
      trigger={<MoreVertical className="h-5 w-5" />}
      actions={actions}
      title="Equipment Actions"
    />
  )
}
```

### 4. SwipeableListItem
Swipe gestures for quick actions on list items.

```tsx
import { SwipeableListItem } from '@/components/mobile'
import { Check, X } from 'lucide-react'

function GuardListItem({ guard }) {
  return (
    <SwipeableListItem
      onSwipeRight={() => approveGuard(guard.id)}
      onSwipeLeft={() => rejectGuard(guard.id)}
      rightAction={<span className="text-white font-medium">Reject</span>}
      leftAction={<span className="text-white font-medium">Approve</span>}
    >
      <div className="p-4">
        <h3>{guard.fullName}</h3>
        <p>{guard.badgeId}</p>
      </div>
    </SwipeableListItem>
  )
}
```

### 5. PullToRefresh
Pull-to-refresh functionality for mobile pages.

```tsx
import { PullToRefresh } from '@/components/mobile'

function DashboardPage() {
  const refreshData = async () => {
    await router.refresh()
  }

  return (
    <PullToRefresh onRefresh={refreshData}>
      <DashboardContent />
    </PullToRefresh>
  )
}
```

### 6. MobileDashboardSection
Collapsible sections for mobile dashboard.

```tsx
import { MobileDashboardSection } from '@/components/mobile'

function MobileDashboard() {
  return (
    <div className="lg:hidden">
      <MobileDashboardSection title="Summary" defaultOpen>
        <SummaryCards />
      </MobileDashboardSection>

      <MobileDashboardSection title="Recent Activity">
        <ActivityFeed />
      </MobileDashboardSection>

      <MobileDashboardSection title="Quick Actions">
        <ActionButtons />
      </MobileDashboardSection>
    </div>
  )
}
```

### 7. MobileBreadcrumbs
Breadcrumbs with back button for mobile navigation.

```tsx
import { MobileBreadcrumbs } from '@/components/mobile'

function EquipmentDetailPage() {
  return (
    <div>
      <MobileBreadcrumbs />
      <EquipmentDetail />
    </div>
  )
}
```

### 8. MobileFormModal
Full-screen form modals for mobile.

```tsx
import { MobileFormModal } from '@/components/mobile'

function AddEquipmentButton() {
  return (
    <MobileFormModal
      trigger={<Button>Add Equipment</Button>}
      title="Add New Equipment"
    >
      <AddEquipmentForm />
    </MobileFormModal>
  )
}
```

### 9. VirtualizedList
Virtual scrolling for long lists (performance optimization).

```tsx
import { VirtualizedList } from '@/components/mobile'

function GuardList({ guards }) {
  return (
    <VirtualizedList
      items={guards}
      renderItem={(guard) => <GuardCard guard={guard} />}
      estimateSize={80}
      height="600px"
    />
  )
}
```

### 10. OfflineIndicator
Shows connectivity status on mobile.

**Note:** This is automatically included in the dashboard layout. No manual implementation needed.

## Integration Examples

### Example 1: Inventory Page with Mobile Card View

```tsx
// inventory/page.tsx
import { MobileCardView } from '@/components/mobile'
import { MobileSearchBar } from '@/components/mobile'

export default function InventoryPage({ equipment, categories }) {
  const [searchQuery, setSearchQuery] = useState('')

  const columns = [
    {
      key: 'itemName',
      label: 'Item Name',
      render: (item) => item.itemName
    },
    {
      key: 'category',
      label: 'Category',
      render: (item) => item.category.name
    },
    {
      key: 'available',
      label: 'Available',
      render: (item) => `${item.availableQuantity} / ${item.totalQuantity}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <span className={item.availableQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>
          {item.availableQuantity > 0 ? 'In Stock' : 'Out of Stock'}
        </span>
      )
    }
  ]

  const filteredEquipment = equipment.filter(item =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <MobileSearchBar onSearch={setSearchQuery} placeholder="Search equipment..." />

      {/* Desktop table */}
      <Table className="hidden lg:block">
        <TableHeader>
          <TableRow>
            <TableHead>Item Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEquipment.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.itemName}</TableCell>
              <TableCell>{item.category.name}</TableCell>
              <TableCell>{item.availableQuantity}</TableCell>
              <TableCell>{item.availableQuantity > 0 ? 'In Stock' : 'Out of Stock'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>View</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Mobile card view */}
      <MobileCardView data={filteredEquipment} columns={columns} />
    </div>
  )
}
```

### Example 2: Guards Page with Swipe Actions

```tsx
// guards/page.tsx
import { SwipeableListItem } from '@/components/mobile'
import { MobileActionSheet } from '@/components/mobile'
import { Check, X, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'

export default function GuardsPage({ guards }) {
  return (
    <div>
      {guards.map(guard => (
        <SwipeableListItem
          key={guard.id}
          onSwipeRight={() => activateGuard(guard.id)}
          onSwipeLeft={() => deactivateGuard(guard.id)}
          rightAction={<span className="text-white font-medium">Deactivate</span>}
          leftAction={<span className="text-white font-medium">Activate</span>}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {guard.photoUrl && (
                  <img src={guard.photoUrl} alt={guard.fullName} className="w-10 h-10 rounded-full" />
                )}
                <div>
                  <h3 className="font-semibold">{guard.fullName}</h3>
                  <p className="text-sm text-slate-500">{guard.badgeId}</p>
                </div>
              </div>
              <MobileActionSheet
                trigger={<MoreVertical className="h-5 w-5 text-slate-400" />}
                actions={[
                  { label: 'View Profile', icon: Eye, onClick: () => router.push(`/guards/${guard.id}`) },
                  { label: 'Edit', icon: Edit, onClick: () => openEditDialog(guard) },
                  { label: 'Delete', icon: Trash2, variant: 'destructive', onClick: () => deleteGuard(guard.id) }
                ]}
              />
            </div>
          </Card>
        </SwipeableListItem>
      ))}
    </div>
  )
}
```

### Example 3: Dashboard with Pull-to-Refresh

```tsx
// dashboard/page.tsx
import { PullToRefresh } from '@/components/mobile'
import { MobileDashboardSection } from '@/components/mobile'

export default function DashboardPage({ stats }) {
  const refreshData = async () => {
    router.refresh()
  }

  return (
    <PullToRefresh onRefresh={refreshData}>
      <div className="lg:hidden">
        <MobileDashboardSection title="Summary" defaultOpen>
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard title="Issued" value={stats.kpis.activeIssuedUnits} />
            <SummaryCard title="Available" value={stats.kpis.availableItems} />
            <SummaryCard title="Overdue" value={stats.kpis.overdueCount} />
            <SummaryCard title="Today" value={stats.kpis.todayTransactions} />
          </div>
        </MobileDashboardSection>

        <MobileDashboardSection title="Recent Activity">
          <ActivityFeed activities={stats.recentMovements} />
        </MobileDashboardSection>
      </div>

      {/* Desktop dashboard */}
      <div className="hidden lg:block">
        {/* Desktop dashboard content */}
      </div>
    </PullToRefresh>
  )
}
```

## CSS Enhancements

The following CSS classes have been added to `globals.css`:

- `.touch-target` - Ensures 44px minimum touch targets
- `.mobile-slide-up` - Slide up animation for mobile modals
- `.mobile-fade-in` - Fade in animation
- `.mobile-scale-in` - Scale in animation
- Viewport height handling for mobile keyboard

## Hooks

### useMobileKeyboard

```tsx
import { useMobileKeyboard } from '@/hooks/useMobileKeyboard'

function FormPage() {
  useMobileKeyboard() // Initialize at component level

  return (
    <form>
      <input type="text" />
      <input type="number" />
    </form>
  )
}
```

## Mobile Navigation Improvements

The `MobileBottomNav` component now includes:

1. **Badge Counts** - Shows pending bookings and overdue items count
2. **Haptic Feedback** - Vibration on navigation (mobile only)
3. **Theme Toggle** - Light/dark mode switch in More menu
4. **Auto-refresh** - Badge counts refresh every 30 seconds

## Best Practices

1. **Always provide desktop alternatives** - Mobile components should complement, not replace, desktop UI
2. **Test on actual devices** - Use Chrome DevTools device emulation for initial testing, but verify on real devices
3. **Progressive enhancement** - Ensure functionality works without mobile-specific features
4. **Performance** - Use VirtualizedList for long lists (>100 items)
5. **Accessibility** - All touch targets meet 44px minimum (automatically applied)
6. **Network awareness** - Offline indicator helps users understand connectivity issues

## Troubleshooting

### MobileBottomNav badge counts not showing
- Ensure API endpoints `/api/bookings` and `/api/equipment/active` are accessible
- Check browser console for errors

### Swipe actions not working
- Ensure `react-swipeable` is installed
- Check that the component has proper touch event handling
- Verify z-index stacking context

### Pull-to-refresh interfering with scroll
- The component only activates at the top of the page (scrollY === 0)
- Adjust the `threshold` prop if needed

### Keyboard covering inputs on mobile
- Ensure `useMobileKeyboard` hook is called in your component
- Check that viewport height CSS is applied correctly

## Future Enhancements

Consider adding:
- Voice search integration
- Biometric authentication (fingerprint/face ID)
- PWA support for offline functionality
- Push notifications for alerts
- Camera integration for QR code scanning
