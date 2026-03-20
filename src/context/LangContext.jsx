import { createContext, useContext, useState } from 'react'

const LangContext = createContext({})

const translations = {
  en: {
    // NAV
    home: 'Home', products: 'Products', bulkOrders: 'Bulk Orders',
    trackOrder: 'Track Order', login: 'Login', logout: 'Logout',
    cart: 'Cart', myOrders: 'My Orders', profile: 'Profile',
    // HOME
    heroTitle: 'Fresh Frozen Food', heroSubtitle: 'Delivered Fast',
    heroDesc: 'Bulk & normal orders — straight from supplier to your door',
    orderNow: 'Order Now', bulkQuote: 'Need Bulk Quote?',
    categories: 'Categories', selectCategory: 'Select your category',
    allProducts: 'All Products', freshFrozen: 'Fresh frozen, ready to cook',
    all: 'All', normal: 'Normal', bulk: 'Bulk',
    addToCart: 'Add', perKg: '/ kg', perPack: '/ pack',
    inStock: 'In Stock', outOfStock: 'Out of Stock',
    bulkBannerTitle: 'Bulk Orders Get Special Price!',
    bulkBannerDesc: 'Special wholesale rates for Restaurants, Hotels & Caterers',
    getBulkQuote: 'Get Bulk Quote →',
    // LOGIN
    loginTitle: 'Welcome to FrozenMart', enterPhone: 'Enter your mobile number',
    sendOtp: 'Send OTP', enterOtp: 'Enter OTP', verifyOtp: 'Verify OTP',
    resendOtp: 'Resend OTP', newSupplier: 'New Supplier? Register here',
    // CART
    yourCart: 'Your Cart', emptyCart: 'Your cart is empty',
    subtotal: 'Subtotal', gst: 'GST (5%)', deliveryFee: 'Delivery Fee',
    total: 'Total', checkout: 'Proceed to Checkout', remove: 'Remove',
    // CHECKOUT
    deliveryAddress: 'Delivery Address', fullName: 'Full Name',
    phone: 'Phone', address: 'Address', area: 'Area', pincode: 'Pincode',
    deliverySlot: 'Delivery Slot', morning: 'Morning (9AM-1PM)',
    evening: 'Evening (4PM-8PM)', placeOrder: 'Place Order & Pay',
    orderSummary: 'Order Summary',
    // TRACKING
    trackYourOrder: 'Track Your Order', orderId: 'Order ID',
    orderPlaced: 'Order Placed', confirmed: 'Confirmed',
    preparing: 'Preparing', readyPickup: 'Ready for Pickup',
    outForDelivery: 'Out for Delivery', delivered: 'Delivered',
    // SUPPLIER
    supplierDashboard: 'Supplier Dashboard', newOrders: 'New Orders',
    pendingOrders: 'Pending Orders', completedToday: 'Completed Today',
    stockAlert: 'Stock Alert', updateStock: 'Update Stock',
    acceptOrder: 'Accept', rejectOrder: 'Reject',
    readyForPickup: 'Ready for Pickup', stockManagement: 'Stock Management',
    currentStock: 'Current Stock', updateQty: 'Update Quantity',
    supplierRegister: 'Supplier Registration',
    // ADMIN
    adminDashboard: 'Admin Dashboard', todayOrders: "Today's Orders",
    todayRevenue: "Today's Revenue", totalSuppliers: 'Total Suppliers',
    pendingApprovals: 'Pending Approvals', ordersManager: 'Orders Manager',
    stockManager: 'Stock Manager', suppliersManager: 'Suppliers',
    reports: 'Reports', approve: 'Approve', reject: 'Reject',
    setMargin: 'Set Margin %', addProduct: 'Add Product',
  },
  te: {
    // NAV
    home: 'హోమ్', products: 'ఉత్పత్తులు', bulkOrders: 'బల్క్ ఆర్డర్లు',
    trackOrder: 'ట్రాక్ చేయి', login: 'లాగిన్', logout: 'లాగ్అవుట్',
    cart: 'కార్ట్', myOrders: 'నా ఆర్డర్లు', profile: 'ప్రొఫైల్',
    // HOME
    heroTitle: 'తాజా ఫ్రోజన్ ఫుడ్', heroSubtitle: 'వేగంగా డెలివరీ',
    heroDesc: 'బల్క్ & నార్మల్ ఆర్డర్లు — సప్లయర్ నుండి మీ ఇంటికి నేరుగా',
    orderNow: 'ఆర్డర్ చేయి', bulkQuote: 'బల్క్ కోట్ కావాలా?',
    categories: 'వర్గాలు', selectCategory: 'మీ వర్గం ఎంచుకోండి',
    allProducts: 'అన్ని ఉత్పత్తులు', freshFrozen: 'తాజా ఫ్రోజన్, వండటానికి రెడీ',
    all: 'అన్నీ', normal: 'నార్మల్', bulk: 'బల్క్',
    addToCart: 'కార్ట్‌కి', perKg: '/ కిలో', perPack: '/ పాక్',
    inStock: 'స్టాక్ ఉంది', outOfStock: 'స్టాక్ లేదు',
    bulkBannerTitle: 'బల్క్ ఆర్డర్లకు స్పెషల్ ధర!',
    bulkBannerDesc: 'రెస్టారెంట్లు, హోటళ్లు, క్యాటరర్లకు ప్రత్యేక థోక్ రేట్లు',
    getBulkQuote: 'బల్క్ కోట్ తీసుకో →',
    // LOGIN
    loginTitle: 'FrozenMart కి స్వాగతం', enterPhone: 'మీ మొబైల్ నంబర్ ఇవ్వండి',
    sendOtp: 'OTP పంపించు', enterOtp: 'OTP ఇవ్వండి', verifyOtp: 'OTP వెరిఫై చేయి',
    resendOtp: 'OTP మళ్ళీ పంపు', newSupplier: 'కొత్త సప్లయర్? ఇక్కడ రిజిస్టర్ చేయండి',
    // CART
    yourCart: 'మీ కార్ట్', emptyCart: 'కార్ట్ ఖాళీగా ఉంది',
    subtotal: 'సబ్‌టోటల్', gst: 'GST (5%)', deliveryFee: 'డెలివరీ చార్జ్',
    total: 'మొత్తం', checkout: 'చెక్అవుట్ చేయి', remove: 'తొలగించు',
    // CHECKOUT
    deliveryAddress: 'డెలివరీ అడ్రస్', fullName: 'పూర్తి పేరు',
    phone: 'ఫోన్', address: 'అడ్రస్', area: 'ఏరియా', pincode: 'పిన్‌కోడ్',
    deliverySlot: 'డెలివరీ సమయం', morning: 'ఉదయం (9AM-1PM)',
    evening: 'సాయంత్రం (4PM-8PM)', placeOrder: 'ఆర్డర్ చేసి పేమెంట్ చేయి',
    orderSummary: 'ఆర్డర్ సారాంశం',
    // TRACKING
    trackYourOrder: 'మీ ఆర్డర్ ట్రాక్ చేయండి', orderId: 'ఆర్డర్ ID',
    orderPlaced: 'ఆర్డర్ చేశారు', confirmed: 'కన్ఫర్మ్ అయింది',
    preparing: 'తయారు చేస్తున్నారు', readyPickup: 'పికప్‌కు రెడీ',
    outForDelivery: 'డెలివరీకి బయలుదేరింది', delivered: 'డెలివర్ అయింది',
    // SUPPLIER
    supplierDashboard: 'సప్లయర్ డాష్‌బోర్డ్', newOrders: 'కొత్త ఆర్డర్లు',
    pendingOrders: 'పెండింగ్ ఆర్డర్లు', completedToday: 'ఈరోజు పూర్తయినవి',
    stockAlert: 'స్టాక్ అలర్ట్', updateStock: 'స్టాక్ అప్‌డేట్',
    acceptOrder: 'అంగీకరించు', rejectOrder: 'తిరస్కరించు',
    readyForPickup: 'పికప్‌కు రెడీ', stockManagement: 'స్టాక్ మేనేజ్‌మెంట్',
    currentStock: 'ప్రస్తుత స్టాక్', updateQty: 'పరిమాణం అప్‌డేట్ చేయి',
    supplierRegister: 'సప్లయర్ రిజిస్ట్రేషన్',
    // ADMIN
    adminDashboard: 'అడ్మిన్ డాష్‌బోర్డ్', todayOrders: 'ఈరోజు ఆర్డర్లు',
    todayRevenue: 'ఈరోజు ఆదాయం', totalSuppliers: 'మొత్తం సప్లయర్లు',
    pendingApprovals: 'పెండింగ్ అప్రూవల్స్', ordersManager: 'ఆర్డర్స్ మేనేజర్',
    stockManager: 'స్టాక్ మేనేజర్', suppliersManager: 'సప్లయర్లు',
    reports: 'రిపోర్ట్స్', approve: 'అప్రూవ్', reject: 'రిజెక్ట్',
    setMargin: 'మార్జిన్ % సెట్ చేయి', addProduct: 'ఉత్పత్తి జోడించు',
  }
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en')
  const t = (key) => translations[lang][key] || key
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
