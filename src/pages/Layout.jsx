

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from '@/api/entities';
import { Class } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Home,
  Mic,
  CreditCard,
  TrendingUp,
  Volume2,
  Stethoscope,
  DollarSign,
  Crown,
  BookOpen,
  Clapperboard,
  ShieldCheck,
  Settings,
  FileSignature,
  HeartPulse,
  Bot,
  BarChart3
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import GamificationProfile from './components/gamification/GamificationProfile';
import { getEffectiveAccountType, getDaysRemaining, PLAN_NAMES } from "@/components/utils/subscriptionLimits";
import FloatingAssistant from './components/assistant/FloatingAssistant';

// SEO Helper
const updateMetaTags = (tags) => {
    // Clear existing meta tags added by this function
    document.querySelectorAll('[data-b44-seo]').forEach(el => el.remove());

    document.title = tags.title;

    Object.entries(tags.meta).forEach(([name, content]) => {
        const meta = document.createElement('meta');
        meta.setAttribute('data-b44-seo', 'true');
        if (name.startsWith('og:') || name.startsWith('fb:') || name.startsWith('article:') || name.startsWith('al:')) {
            meta.setAttribute('property', name);
        } else {
            meta.name = name;
        }
        meta.content = content;
        document.head.appendChild(meta);
    });

    // Handle canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('data-b44-seo', 'true');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = tags.canonical;
};

const defaultMeta = {
    title: 'FaMED Test Prep — Deutsche medizinische Sprachprüfung vorbereiten',
    meta: {
        description: 'Bereiten Sie sich auf die deutsche medizinische Sprachprüfung vor. KI-gestützte Ausspracheübungen, Anamnese-Training und Aufklärungsgespräche für Ärzte.',
        keywords: 'FaMED, medizinische Sprachprüfung, deutsch lernen, Arzt Deutschland, medizinische Kommunikation, Anamnese, Aufklärung, KI Sprachtraining',
        author: 'FaMED Test Prep',
        'og:type': 'website',
        'og:title': 'FaMED Test Prep — Deutsche medizinische Sprachprüfung',
        'og:description': 'KI-gestützte Vorbereitung auf die deutsche medizinische Sprachprüfung. Anamnese, Aufklärung und Aussprachetraining.',
        'og:image': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/04c28b98a_pretty_snap_2025_7_11_0_49.png',
        'og:url': 'https://famedtestprep.com',
        'og:site_name': 'FaMED Test Prep',
        'og:locale': 'de_DE',
        'twitter:card': 'summary_large_image',
        'twitter:title': 'FaMED Test Prep — Deutsche medizinische Sprachprüfung',
        'twitter:description': 'KI-gestützte Vorbereitung auf die deutsche medizinische Sprachprüfung mit realistischen Fallstudien.',
        'twitter:image': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/04c28b98a_pretty_snap_2025_7_11_0_49.png',
        'twitter:site': '@famedtest',
        'apple-mobile-web-app-title': 'FaMED Prep',
        'application-name': 'FaMED Test Prep',
        'msapplication-TileColor': '#059669',
        'theme-color': '#059669',
        robots: 'index, follow',
        language: 'de',
        'Content-Language': 'de',
        rating: 'general',
        distribution: 'global',
        revisit: '7 days',
        'google-site-verification': 'your-google-verification-code-here'
    },
    canonical: 'https://famedtestprep.com'
};

const homeMeta = {
    title: 'FaMED Test Prep — KI-gestützte medizinische Sprachprüfung Vorbereitung',
    meta: {
        description: 'Bereiten Sie sich erfolgreich auf die FaMED Sprachprüfung vor. Realistische Anamnese & Aufklärung Simulationen mit sofortigem KI-Feedback. Kostenlos starten!',
        keywords: 'FaMED Test, medizinische Sprachprüfung Deutschland, Arzt Sprachtest, deutsche medizinische Kommunikation, Anamnese Training, Aufklärungsgespräch üben, medizinisches Deutsch lernen, KI Aussprachetrainer, Facharzt Sprachprüfung',
        'og:title': 'FaMED Test Prep — KI-gestützte medizinische Sprachprüfung Vorbereitung',
        'og:description': 'Realistische Anamnese & Aufklärung Simulationen mit KI-Feedback. Üben Sie medizinische Kommunikation wie in der echten Prüfung. Jetzt kostenlos starten!',
        'og:image': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/04c28b98a_pretty_snap_2025_7_11_0_49.png',
        'og:url': 'https://famedtestprep.com',
        'og:type': 'website',
        'twitter:card': 'summary_large_image',
        'twitter:title': 'FaMED Test Prep — KI-gestützte Vorbereitung',
        'twitter:description': 'Realistische medizinische Fallstudien mit KI-feedback für die deutsche Sprachprüfung.',
        'twitter:image': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/04c28b98a_pretty_snap_2025_7_11_0_49.png',
        'article:author': 'FaMED Test Prep Team',
        'article:publisher': 'https://famedtestprep.com',
        'fb:app_id': 'your-facebook-app-id',
        'ia:markup_url': 'https://famedtestprep.com',
        'al:web:url': 'https://famedtestprep.com'
    },
    canonical: 'https://famedtestprep.com',
};

// --- Complete Profile Modal Component ---
const CompleteProfileModal = ({ onComplete }) => {
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !fullName.includes(' ')) {
      setError('Bitte geben Sie Ihren vollständigen Vor- und Nachnamen ein.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await User.updateMyUserData({
        full_name: fullName.trim(),
        profile_complete: true,
      });
      onComplete();
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white dark:bg-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Willkommen bei Famed Test!</CardTitle>
            <CardDescription>Ein letzter Schritt, um Ihr Konto einzurichten.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vollständiger Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="z.B. Max Mustermann"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="text-base"
                />
                 {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Speichern...' : 'Profil abschließen & Starten'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// --- UserProfile Component ---
const UserProfile = ({ user, isUserLoading }) => {
  const navigate = useNavigate();

  if (isUserLoading) {
    return (
      <div className="p-4 w-full">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
        <h3 className="font-bold text-gray-800 dark:text-white">Starten Sie Ihre Lernreise</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-3">Erstellen Sie ein kostenloses Konto, um Ihren Fortschritt zu speichern.</p>
        <Link to={createPageUrl("Upgrade")}>
          <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg">
            Pläne ansehen & Registrieren
          </Button>
        </Link>
      </div>
    );
  }

  const effectiveAccountType = getEffectiveAccountType(user);
  const daysRemaining = getDaysRemaining(user);
  const planName = PLAN_NAMES[effectiveAccountType];

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
        onClick={() => navigate(createPageUrl("UserSettings"))}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center overflow-hidden">
          {user.profile_picture_url ? (
            <img src={user.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-600 dark:text-gray-300 font-semibold text-base">{user.full_name?.charAt(0) || 'U'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user.full_name || "Benutzer"}</p>
          <p className="text-xs text-green-600 dark:text-green-400 truncate">{user.email}</p>
        </div>
      </div>
      
      <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border ${
        effectiveAccountType === 'free' 
          ? 'text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
          : effectiveAccountType === 'paid_1m'
          ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          : 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-800'
      }`}>
        <Crown className={`w-4 h-4 ${
          effectiveAccountType === 'free' ? 'text-gray-500' : 'text-current'
        }`} />
        <span>{planName}</span>
        {effectiveAccountType !== 'free' && daysRemaining > 0 && (
          <span className="opacity-75">({daysRemaining}d)</span>
        )}
      </div>

      {effectiveAccountType === 'free' && (
        <Link to={createPageUrl("Upgrade")}>
          <Button size="sm" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        </Link>
      )}
    </div>
  );
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [navigationItems, setNavigationItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userClassName, setUserClassName] = useState(null);

  // Check if this is the home page - both by path and page name
  const isHomePage = (location.pathname === '/' || location.pathname === '/Home' || currentPageName === 'Home');

  useEffect(() => {
      // SEO Management - always set home meta for the home page
      if (isHomePage) {
          updateMetaTags(homeMeta);
      } else {
          updateMetaTags(defaultMeta);
      }
  }, [currentPageName, isHomePage]);

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }

    const loadUser = async () => {
      setIsUserLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        // REMOVED: No more auto-redirect to dashboard
        // Users can manually navigate to dashboard if they want
        
        if (currentUser && !currentUser.profile_complete) {
          setShowProfileModal(true);
        }
        if (currentUser && currentUser.class_id) {
            try {
                const userClass = await Class.get(currentUser.class_id);
                setUserClassName(userClass.class_name);
            } catch (e) {
                console.error("Could not fetch class name for user", e);
            }
        }
        
        const useDarkMode = currentUser?.dark_mode !== false;
        if (useDarkMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      } catch (error) {
        // User not authenticated - clear any stale data
        setUser(null);
        setUserClassName(null);
        document.documentElement.classList.add('dark');
      }
      setIsUserLoading(false);
    };
    loadUser();
  }, [isHomePage, location.pathname]);

  useEffect(() => {
    const authenticatedItems = [
      { title: "Dashboard", url: createPageUrl("Dashboard"), icon: Home, color: "text-sky-500" },
      { title: "Anamnese", url: createPageUrl("Anamnese"), icon: HeartPulse, color: "text-rose-500" },
      { title: "Aufklärung", url: createPageUrl("Aufklaerung"), icon: FileSignature, color: "text-purple-500" },
      { title: "Arzt-Fälle", url: createPageUrl("MedicalCases"), icon: Stethoscope, color: "text-red-500" },
      { title: "FaMED Protokoll", url: createPageUrl("EbookReader"), icon: BookOpen, color: "text-orange-500" },
      { title: "Lernkarten", url: createPageUrl("Flashcards"), icon: CreditCard, color: "text-amber-500" },
      { title: "Meine Erfolge", url: createPageUrl("Progress"), icon: TrendingUp, color: "text-emerald-500" },
      { title: "Reports", url: createPageUrl("Reports"), icon: BarChart3, color: "text-yellow-500" },
      { title: "Pläne upgraden", url: createPageUrl("Upgrade"), icon: DollarSign, color: "text-lime-500" },
      { title: "Einstellungen", url: createPageUrl("UserSettings"), icon: Settings, color: "text-slate-500" },
    ];

    const adminOnlyItems = [
      { title: "Sprechübung", url: createPageUrl("Practice"), icon: Mic, color: "text-rose-500" },
      { title: "On Demand", url: createPageUrl("OnDemand"), icon: Clapperboard, color: "text-indigo-500" },
    ];
    
    const guestItems = [
        { title: "Home", url: createPageUrl("Home"), icon: Home, color: "text-sky-500" },
        { title: "Pläne & Preise", url: createPageUrl("Upgrade"), icon: DollarSign, color: "text-lime-500" }
    ];

    if (user) {
      if (user.role === 'admin') {
        setNavigationItems([
          authenticatedItems[0], // Dashboard
          { title: "Admin Panel", url: createPageUrl("AdminPanel"), icon: ShieldCheck, color: "text-purple-500" },
          ...authenticatedItems.slice(1, 3), // Anamnese, Aufklärung
          ...adminOnlyItems, // Sprechübung, On Demand - only for admins
          ...authenticatedItems.slice(3) // Rest of the items (Arzt-Fälle onwards)
        ]);
      } else {
        setNavigationItems(authenticatedItems);
      }
    } else {
      setNavigationItems(guestItems);
    }
  }, [user]);

  const handleProfileComplete = async () => {
    setShowProfileModal(false);
    const updatedUser = await User.me();
    setUser(updatedUser);
  };

  // Show hero page for EVERYONE on home page (both guests and logged-in users)
  if (isHomePage && !isUserLoading) {
    return (
      <>
        {showProfileModal && <CompleteProfileModal onComplete={handleProfileComplete} />}
        {children}
      </>
    );
  }

  // Show loading while checking auth status on home page
  if (isHomePage && isUserLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      {showProfileModal && !isHomePage && <CompleteProfileModal onComplete={handleProfileComplete} />}
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
        <Sidebar className="border-r border-green-100/50 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex flex-col">
          <SidebarHeader className="border-b border-green-100/50 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-800 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/dea42d9a1_9108119c1_logo.jpg" alt="Famed Test" className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">Famed Test</h2>
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">Deutsch Sprachprüfung</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4 flex-1">
            {userClassName && (
                <Link to={createPageUrl("ClassDashboard")} className="block px-4 py-2 mb-4 text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <p className="text-sm font-semibold">{userClassName}</p>
                    <p className="text-xs opacity-90">Zur Klasse</p>
                </Link>
            )}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`
                          hover:bg-green-50 dark:hover:bg-gray-700 transition-all duration-300
                          rounded-xl h-11 text-sm font-medium
                          ${location.pathname.includes(item.url)
                            ? 'bg-gradient-to-r from-green-800 to-green-700 text-white shadow-lg'
                            : 'text-gray-700 dark:text-gray-300 hover:text-green-800 dark:hover:text-white'
                          }
                        `}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                          <item.icon className={`w-5 h-5 transition-colors ${location.pathname.includes(item.url) ? 'text-white' : item.color}`} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-green-100/50 dark:border-gray-700 p-6">
            <UserProfile user={user} isUserLoading={isUserLoading} />
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-green-100/50 dark:border-gray-700 px-6 py-3 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-green-50 dark:hover:bg-gray-700 p-2 rounded-xl transition-colors duration-200 md:hidden" />
                <div className="hidden md:flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-800 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/dea42d9a1_9108119c1_logo.jpg" alt="Famed Test" className="w-5 h-5" />
                    </div>
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">Famed Test</h2>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white md:hidden">Famed Test</h1>
              </div>
              <div className="flex-1" />
              <a href="https://famed-test.de/buchungsseite/" target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-px">
                  Prüfung Buchen jetzt!
                </Button>
              </a>
              {user && <GamificationProfile user={user} />}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Assistant - Only show for admins */}
      {user?.role === 'admin' && <FloatingAssistant />}
    </SidebarProvider>
  );
}

