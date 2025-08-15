import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BarChart3, 
  Mic, 
  Stethoscope, 
  CreditCard, 
  Settings,
  LogOut,
  Menu
} from 'lucide-react';

export default function SimpleLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/practice', icon: Mic, label: 'Practice' },
    { path: '/medicalcases', icon: Stethoscope, label: 'Medical Cases' },
    { path: '/flashcards', icon: CreditCard, label: 'Flashcards' },
    { path: '/progress', icon: BarChart3, label: 'Progress' },
    { path: '/usersettings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">FAMED Test Prep</h2>
        </div>
        
        <nav className="mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-green-100 text-green-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
          
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 mx-2 mt-4 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
