# QuickShop - Self-Service Kiosk System

A modern, touch-optimized self-service retail kiosk built with React and FastAPI, designed for intuitive shopping experiences suitable for all age groups.

## 🎯 Project Overview

QuickShop is a comprehensive kiosk system that reconstructs and improves upon traditional self-service interfaces with:

- **Touch-First Design:** Large buttons (60-120px), generous spacing, clear visual feedback
- **Accessibility:** High contrast, large fonts, icons with text labels, simple language
- **Complete Shopping Flow:** Browse categories → Select products → Cart management → Checkout → Payment → Confirmation
- **6 Product Categories:** Fast Food, Beverages, Snacks, Electronics, Personal Care, Breakfast
- **26+ Products:** Realistic product catalog with professional images

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 19, React Router, Tailwind CSS, Radix UI components
- **Backend:** FastAPI, Motor (async MongoDB driver)
- **Database:** MongoDB
- **State Management:** React Context API with sessionStorage persistence

### Key Design Improvements

#### 1. Visual Hierarchy
- **Typography:** Extra-large headings (5xl-7xl), readable body text (2xl-3xl)
- **Color Scheme:** High-contrast colors with clear color coding (green for prices, blue for actions)
- **Spacing:** Generous padding and margins for touch targets

#### 2. Navigation
- **Clear Path:** Home button, back navigation, cart indicator with count
- **Breadcrumb Flow:** Linear progression through shopping steps
- **Visual Indicators:** Active states, selected items, cart count badge

#### 3. Interactions
- **Touch Targets:** Minimum 60px height for all interactive elements
- **Visual Feedback:** Scale animations, color changes, loading states
- **Transitions:** Smooth 150ms transitions for better perceived performance

#### 4. Accessibility
- **Font Sizes:** 20px minimum body text, 32px+ headings
- **Contrast Ratios:** WCAG AA compliant color combinations
- **Descriptive Labels:** All buttons and inputs clearly labeled
- **Focus Indicators:** 4px blue outlines for keyboard navigation
- **Test IDs:** Comprehensive data-testid attributes for testing and automation

## 📁 Project Structure

```
/app
├── backend/
│   ├── server.py           # FastAPI application with all endpoints
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables (MONGO_URL, DB_NAME)
│
└── frontend/
    ├── src/
    │   ├── App.js              # Main app with routing
    │   ├── App.css             # Global kiosk styles
    │   ├── context/
    │   │   └── CartContext.js  # Shopping cart state management
    │   ├── screens/
    │   │   ├── WelcomeScreen.js      # Welcome/start screen
    │   │   ├── CategoriesScreen.js   # Category selection
    │   │   ├── ProductsScreen.js     # Product listing
    │   │   ├── CartScreen.js         # Shopping cart
    │   │   ├── CheckoutScreen.js     # Checkout & payment
    │   │   └── ConfirmationScreen.js # Order confirmation
    │   └── components/ui/      # Reusable UI components (Radix UI)
    └── package.json
```

## 🚀 API Endpoints

### Categories
- `GET /api/categories` - Get all active categories

### Products
- `GET /api/products` - Get all products
- `GET /api/products?category_id={id}` - Filter products by category
- `GET /api/products/{id}` - Get single product

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get recent orders
- `GET /api/orders/{id}` - Get order by ID

### Development
- `POST /api/seed-data` - Seed database with sample data

## 🎨 User Flow

1. **Welcome Screen**
   - Large "Start Shopping" button
   - Language selection (English/Español)
   - Clear instructions

2. **Category Selection**
   - 2x3 grid of category cards
   - High-quality images
   - Clear descriptions
   - Cart indicator in header

3. **Product Browsing**
   - Product grid with images
   - Prices prominently displayed
   - One-tap "Add to Cart"
   - Toast notifications for feedback

4. **Shopping Cart**
   - Item list with images
   - Quantity controls (+/-)
   - Remove item option
   - Live total calculation
   - Order summary sidebar

5. **Checkout**
   - Order review
   - Payment method selection (Card/Cash/Mobile)
   - Visual selection feedback
   - Confirm payment button

6. **Order Confirmation**
   - Success animation
   - Order number
   - Receipt details
   - Print receipt option
   - Auto-return timer (30 seconds)

## 💡 Key Features

### Cart Management
- Persistent shopping cart using sessionStorage
- Real-time calculations (subtotal, 8% tax, total)
- Quantity adjustments
- Item removal
- Cart count indicator

### Payment Options
- Credit/Debit Card
- Cash
- Mobile Payment
- Visual selection with checkmarks

### Kiosk-Specific Features
- Session auto-reset on welcome screen
- 30-second countdown on confirmation
- Empty cart states
- Clear error messaging
- Touch-optimized scrolling

## 🎯 Accessibility Features

- **Large Touch Targets:** 60-120px minimum for all buttons
- **High Contrast:** Color ratios meeting WCAG AA standards
- **Clear Typography:** Readable fonts at all sizes
- **Iconography:** Icons paired with text labels
- **Keyboard Navigation:** Full keyboard support with visible focus
- **Screen Reader Support:** Semantic HTML and ARIA labels
- **Test Automation:** Comprehensive data-testid attributes

## 📊 Database Schema

### Categories Collection
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "image_url": "string",
  "display_order": "number",
  "active": "boolean"
}
```

### Products Collection
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "price": "number",
  "category_id": "uuid",
  "image_url": "string",
  "in_stock": "boolean",
  "active": "boolean"
}
```

### Orders Collection
```json
{
  "id": "uuid",
  "order_number": "string",
  "items": [
    {
      "product_id": "uuid",
      "product_name": "string",
      "quantity": "number",
      "unit_price": "number",
      "total_price": "number"
    }
  ],
  "subtotal": "number",
  "tax": "number",
  "total": "number",
  "payment_method": "string",
  "status": "string",
  "timestamp": "datetime"
}
```

## 🧪 Testing

The application includes comprehensive test IDs for automated testing:

- `welcome-screen` - Welcome page
- `start-order-button` - Start shopping button
- `category-{name}` - Category cards
- `product-{name}` - Product cards
- `add-to-cart-{id}` - Add to cart buttons
- `cart-button` - Cart navigation
- `cart-count` - Cart item count
- `checkout-button` - Proceed to checkout
- `payment-{type}` - Payment method buttons
- `confirm-payment-button` - Payment confirmation
- `order-number` - Order number display

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB

### Environment Variables

**Backend (.env):**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=kiosk_db
CORS_ORIGINS=*
```

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=https://your-domain.com
```

### Running the Application

1. **Start Backend:**
   ```bash
   cd /app/backend
   pip install -r requirements.txt
   sudo supervisorctl restart backend
   ```

2. **Seed Database:**
   ```bash
   curl -X POST https://your-domain.com/api/seed-data
   ```

3. **Start Frontend:**
   ```bash
   cd /app/frontend
   yarn install
   sudo supervisorctl restart frontend
   ```

4. **Access Application:**
   - Frontend: https://your-domain.com
   - API: https://your-domain.com/api

## 📈 Future Enhancements

- Multi-language support (fully implemented)
- Accessibility mode with larger fonts
- Voice guidance for visually impaired
- Receipt printing integration
- Real payment gateway integration
- Loyalty program integration
- Product search functionality
- Recommendations engine
- Analytics dashboard
- Inventory management

## 🎨 Design Principles

1. **Touch-First:** Every interaction designed for touch screens
2. **Clear Hierarchy:** Visual weight guides user attention
3. **Immediate Feedback:** Every action provides instant response
4. **Error Prevention:** Design prevents mistakes before they happen
5. **Progressive Disclosure:** Information revealed as needed
6. **Accessible by Default:** Works for everyone, including edge cases

## 📝 Notes

- All images sourced from Unsplash (royalty-free)
- Tax rate set at 8% (configurable)
- Order numbers auto-generated with ORD- prefix
- Cart persists in sessionStorage (per-session)
- Backend uses FastAPI with async MongoDB driver
- Frontend uses React 19 with hooks and context

---

**Built with ❤️ for accessible, intuitive self-service experiences**
