
// Subscription limits and helper functions
export const LIMITS = {
  free: {
    weeklySpeechPerSection: 1,
    casesPerSystem: 1,
    anamneseAllowed: 1,
    aufklarungAllowed: 1,
    flashcardsEnabled: false,
    ebookPercent: 50,
    mockExamEnabled: false,
    offlineEnabled: false,
    certificateEnabled: false,
    xpCap: 300
  },
  paid_1m: {
    weeklySpeechPerSection: Infinity,
    casesPerSystem: Infinity,
    anamneseAllowed: Infinity,
    aufklarungAllowed: Infinity,
    flashcardsEnabled: true,
    ebookPercent: 75,
    mockExamEnabled: true,
    offlineEnabled: false,
    certificateEnabled: false,
    xpCap: Infinity
  },
  paid_3m: {
    weeklySpeechPerSection: Infinity,
    casesPerSystem: Infinity,
    anamneseAllowed: Infinity,
    aufklarungAllowed: Infinity,
    flashcardsEnabled: true,
    ebookPercent: 100,
    mockExamEnabled: true,
    offlineEnabled: true,
    certificateEnabled: true,
    xpCap: Infinity
  }
};

export const PLAN_NAMES = {
  free: 'Kostenlos',
  paid_1m: '1-Monat Intensiv',
  paid_3m: '3-Monate Prüfungs-Prep'
};

export const PLAN_PRICES = {
  paid_1m: '€59',
  paid_3m: '€129'
};

// Helper to check if user's plan is expired
export const isExpired = (user) => {
  if (!user?.plan_expiry) return false;
  return new Date(user.plan_expiry) < new Date();
};

// Get current week's Monday in ISO format
export const getCurrentWeekMondayISO = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return monday.toISOString().split('T')[0];
};

// Get effective account type (handles expiry)
export const getEffectiveAccountType = (user) => {
  if (!user) return 'free';
  if (isExpired(user)) return 'free';
  return user.account_type || 'free';
};

// Get days remaining for paid plans
export const getDaysRemaining = (user) => {
  if (!user?.plan_expiry || isExpired(user)) return 0;
  const expiry = new Date(user.plan_expiry);
  const today = new Date();
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

// Generate a random access code
export const generateAccessCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase() + 
         Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Stripe Configuration
export const STRIPE_CONFIG = {
  // Set this to true to enable Stripe payments
  STRIPE_ENABLED: true,
  
  // Payment Success URL - this is where Stripe will redirect after payment
  // This is now dynamically set in getStripePaymentLink for more control
  SUCCESS_URL: `${window.location.origin}/PaymentSuccess?session_id={CHECKOUT_SESSION_ID}`,
  CANCEL_URL: `${window.location.origin}/Upgrade`,
  
  // These are the URLs for your Stripe Payment Links.
  PAYMENT_LINK_URLS: {
    // Live plans - Your actual working links
    paid_1m: 'https://buy.stripe.com/3cIaEY0qd573aZ66Nr7Re00', 
    paid_3m: 'https://buy.stripe.com/3cIbJ21uhczv7MUb3H7Re01',
    
    // Test plan for testing the Stripe payment flow
    test_plan: 'https://buy.stripe.com/28EeVe3Cp1UR3wE4Fj7Re02',
  },
  
  // Your Stripe Keys
  SECRET_KEY: 'sk_test_51QWvWKIZz85vGY8wPsKDuYmABYXdmOZrhyOULQCJECnq9X1H5FDvEqhgVL5eMImyHCJ56Eqxsp7LVxcCw6eGTGaX00y3TbdL7S',
  PUBLISHABLE_KEY: 'pk_test_51QWvWKIZz85vGY8wPsVczkvLXWHgQHBdPQqB1zDSZ6kIjZCJEHGCBrGcPwGcVP5WJkZPHsX7W8p5cBLtjQwGTYNZ00FLtF9hZq'
};

// Helper to get the Stripe Payment Link URL with success redirect
export const getStripePaymentLink = (planId, userEmail, userId) => {
  const baseUrl = STRIPE_CONFIG.PAYMENT_LINK_URLS[planId];
  if (!baseUrl) {
    return null;
  }
  
  const url = new URL(baseUrl);
  
  // Add user info to prefill Stripe's checkout
  url.searchParams.set('prefilled_email', encodeURIComponent(userEmail));
  url.searchParams.set('client_reference_id', userId);
  
  // Dynamically construct the success URL with the plan_id embedded
  // This is the key fix - no more metadata needed!
  const successUrl = new URL(`${window.location.origin}/PaymentSuccess`);
  successUrl.searchParams.set('plan_id', planId);
  successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}'); // Stripe populates this
  
  // Override the default success URL with our dynamic one
  url.searchParams.set('success_url', successUrl.toString());

  return url.toString();
};
