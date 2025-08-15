import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Home, 
  BarChart3, 
  Mic, 
  Stethoscope, 
  CreditCard, 
  Settings,
  LogOut 
} from 'lucide-react';

export default function SimpleNavigation() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/practice', icon: Mic, label: 'Practice' },
    { path: '/medicalcases', icon: Stethoscope, label: 'Cases' },
    { path: '/flashcards', icon: CreditCard, label: 'Flashcards' },
    { path: '/progress', icon: BarChart3, label: 'Progress' },
    { path: '/usersettings', icon: Settings, label: 'Settings' },
  ];

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 text-red-600">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </Card>
  );
}
