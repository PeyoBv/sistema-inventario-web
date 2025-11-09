# Planning Guide

A complete inventory management system with role-based access control, item tracking, location management, and comprehensive movement logging for warehouse operations.

**Experience Qualities**: 
1. **Professional** - Clean, business-focused interface that inspires confidence in data accuracy
2. **Efficient** - Quick data entry and instant feedback for high-volume warehouse operations
3. **Transparent** - Clear audit trails and movement history visible at all times

**Complexity Level**: Complex Application (advanced functionality, accounts)
- Implements multi-role authentication system with different permission levels
- Manages interconnected data models (items, locations, users, movement logs)
- Provides real-time inventory tracking with transaction safety
- Includes comprehensive audit logging for all inventory changes

## Essential Features

### Authentication System
- **Functionality**: Secure login/logout with role-based access (Admin, Bodeguero, Usuario)
- **Purpose**: Protect inventory data and ensure only authorized personnel can modify stock
- **Trigger**: User accesses application without valid session
- **Progression**: Login screen → Enter credentials → Validate → Redirect to role-appropriate dashboard
- **Success criteria**: JWT-style token stored, user role determines accessible features

### Item Management (CRUD)
- **Functionality**: Create, view, update, and delete inventory items with SKU, name, description, quantity, and location
- **Purpose**: Maintain accurate catalog of all warehouse inventory
- **Trigger**: Admin or Bodeguero navigates to inventory section
- **Progression**: Inventory table → Add/Edit button → Form with validation → Save → Update display with toast confirmation
- **Success criteria**: Items persist across sessions, SKU uniqueness enforced, changes logged

### Location Management
- **Functionality**: Define and manage warehouse locations (shelves, zones, warehouses)
- **Purpose**: Track where items are physically stored for efficient retrieval
- **Trigger**: Admin or Bodeguero accesses locations management
- **Progression**: Locations list → Create/Edit → Form → Save → Items can be assigned to location
- **Success criteria**: Locations available in item dropdowns, hierarchical organization supported

### Movement Logging (Check-in/Check-out)
- **Functionality**: Record inventory movements (entrada, salida, ajuste) with automatic quantity updates
- **Purpose**: Maintain accurate stock levels and complete audit trail
- **Trigger**: Bodeguero or Admin initiates stock movement
- **Progression**: Movement form → Select item → Enter quantity → Specify type → Confirm → Update item quantity + create log entry (atomic)
- **Success criteria**: Quantity changes reflected immediately, negative stock prevented, all movements logged with timestamp and user

### User Administration (Admin Only)
- **Functionality**: Create, edit, and manage user accounts with role assignment
- **Purpose**: Control system access and maintain security
- **Trigger**: Admin accesses user management
- **Progression**: User list → Create/Edit → Set username, password, role → Save → User can login with credentials
- **Success criteria**: Password hashing, role-based UI rendering, admin can reset passwords

### Movement History & Audit Trail
- **Functionality**: Comprehensive log viewer showing all inventory movements with filters
- **Purpose**: Provide accountability and historical tracking for compliance
- **Trigger**: Admin or Bodeguero views movement logs
- **Progression**: Logs table → Filter by date/item/user/type → View details → Export capability
- **Success criteria**: All movements tracked, sortable/filterable, shows who did what when

## Edge Case Handling

- **Negative Stock Prevention** - Check-out operations validate sufficient quantity exists before processing
- **Concurrent Updates** - Optimistic locking prevents inventory conflicts when multiple users edit simultaneously  
- **Invalid SKU Duplicates** - Item creation validates SKU uniqueness before saving
- **Orphaned References** - Deleting locations or items checks for dependencies and prevents or cascades appropriately
- **Session Expiration** - Auto-logout after token expiry with redirect to login and preserved navigation intent
- **Missing Data** - Graceful empty states for new installations with quick-start prompts
- **Role Escalation** - All sensitive operations double-check user permissions server-side (KV context)

## Design Direction

The design should feel professional, data-dense yet scannable, with a clean corporate aesthetic reminiscent of modern ERP systems - think subtle gradients, card-based layouts, and clear visual hierarchy that supports rapid data entry without sacrificing elegance.

## Color Selection

Complementary (opposite colors) - Using a sophisticated blue-orange pairing to create visual interest while maintaining professionalism, with blue representing trust/data and orange for action/alerts.

- **Primary Color**: Deep professional blue `oklch(0.45 0.15 250)` - Communicates reliability, trust, and corporate professionalism for main navigation and primary actions
- **Secondary Colors**: Soft slate `oklch(0.92 0.01 250)` for backgrounds, Medium gray `oklch(0.65 0.02 250)` for secondary elements
- **Accent Color**: Warm orange `oklch(0.68 0.18 45)` - Draws attention to important actions (check-in/check-out buttons) and alerts
- **Foreground/Background Pairings**:
  - Background (Light slate `oklch(0.98 0.005 250)`): Dark text `oklch(0.25 0.01 250)` - Ratio 12.8:1 ✓
  - Card (White `oklch(1 0 0)`): Dark text `oklch(0.25 0.01 250)` - Ratio 14.2:1 ✓
  - Primary (Deep blue `oklch(0.45 0.15 250)`): White text `oklch(1 0 0)` - Ratio 7.4:1 ✓
  - Secondary (Soft slate `oklch(0.92 0.01 250)`): Dark text `oklch(0.25 0.01 250)` - Ratio 11.1:1 ✓
  - Accent (Warm orange `oklch(0.68 0.18 45)`): White text `oklch(1 0 0)` - Ratio 4.9:1 ✓
  - Muted (Light gray `oklch(0.95 0.005 250)`): Medium text `oklch(0.50 0.01 250)` - Ratio 6.2:1 ✓

## Font Selection

Typography should convey clarity and efficiency with excellent readability for data-heavy tables - using Inter for its perfect balance of professional polish and screen legibility at all sizes.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Inter SemiBold / 32px / -0.02em tracking / 1.2 line-height
  - H2 (Section Headers): Inter SemiBold / 24px / -0.01em tracking / 1.3 line-height
  - H3 (Card Titles): Inter Medium / 18px / 0 tracking / 1.4 line-height
  - Body (Main Content): Inter Regular / 15px / 0 tracking / 1.5 line-height
  - Small (Table Data): Inter Regular / 14px / 0 tracking / 1.4 line-height
  - Labels (Form Labels): Inter Medium / 13px / 0.01em tracking / 1.4 line-height
  - Captions (Meta Info): Inter Regular / 12px / 0 tracking / 1.3 line-height

## Animations

Animations should be subtle and functional, enhancing the feeling of responsiveness during data operations without slowing down power users - quick transitions (150-200ms) with gentle easing for state changes and form validation feedback.

- **Purposeful Meaning**: Quick fade-ins for toast notifications, subtle scale on button press, smooth slide for drawer panels
- **Hierarchy of Movement**: Priority on movement logs appearing (slide-in), inventory quantity changes (number animation), form validation (shake on error)

## Component Selection

- **Components**: 
  - Table (with sortable headers, hover states) for inventory and movement logs
  - Card for dashboard stats and quick actions
  - Dialog for item/location/user creation and editing forms
  - Select dropdowns for location and item selection in movement forms
  - Badge for role display and movement types
  - Tabs for switching between dashboard views (inventory/movements/users)
  - Avatar for user profile display
  - Alert for stock warnings and validation errors
  - Input with icons (Phosphor) for search and filtering
  - Button variants (default for secondary, primary for main actions, destructive for delete)

- **Customizations**: 
  - Custom DataTable component combining Table + sorting + filtering + pagination
  - Stat card component for dashboard KPIs (total items, low stock alerts, movements today)
  - Movement form with dynamic quantity validation based on movement type

- **States**: 
  - Buttons: Hover with subtle lift, active with scale-down, disabled with opacity and cursor
  - Inputs: Focus with blue ring, error with red border and shake, success with green checkmark
  - Table rows: Hover with light background, selected with border accent

- **Icon Selection**: 
  - Package (Cube) for items/inventory
  - MapPin (buildings) for locations
  - ArrowUp/ArrowDown for check-in/check-out
  - ClockCounterClockwise for movement history
  - Users for user management
  - MagnifyingGlass for search
  - Plus/Pencil/Trash for CRUD operations

- **Spacing**: 
  - Card padding: p-6
  - Section gaps: gap-6
  - Form fields: gap-4
  - Table cells: px-4 py-3
  - Page margins: p-8 (desktop), p-4 (mobile)

- **Mobile**: 
  - Tables convert to stacked card views on mobile (<768px)
  - Navigation drawer collapses to hamburger menu
  - Form fields stack vertically with full width
  - Dashboard stats arrange in single column
  - Movement forms use bottom sheet instead of dialog
