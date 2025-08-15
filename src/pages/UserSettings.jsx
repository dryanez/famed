
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, User as UserIcon, Crown, CreditCard, Mail, Shield, Calendar as CalendarIcon, CheckCircle, Bell, Camera, Moon, Sun, MapPin } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { getEffectiveAccountType, getDaysRemaining, PLAN_NAMES } from "@/components/utils/subscriptionLimits";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function UserSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setEditData({
        full_name: currentUser.full_name || '',
        email: currentUser.email || '',
        test_date: currentUser.test_date ? new Date(currentUser.test_date) : null,
        test_location: currentUser.test_location || '',
        dark_mode: currentUser.dark_mode || false
      });
      if (currentUser.dark_mode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      navigate(createPageUrl("Dashboard"));
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...editData,
        test_date: editData.test_date ? format(editData.test_date, 'yyyy-MM-dd') : null,
        test_location: editData.test_location || null
      };
      await User.updateMyUserData(dataToSave);
      
      if (dataToSave.dark_mode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      const updatedUser = await User.me();
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("Fehler beim Speichern der Daten.");
    }
    setIsSaving(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const { file_url } = await UploadFile({ file });
      await User.updateMyUserData({ profile_picture_url: file_url });
      const updatedUser = await User.me();
      setUser(updatedUser);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Fehler beim Hochladen des Bildes.");
    }
    setIsUploadingImage(false);
  };

  const handleManageSubscription = async () => {
    setIsBillingLoading(true);
    try {
      const billingPortalUrl = await User.getBillingPortalUrl();
      if (billingPortalUrl) {
        window.location.href = billingPortalUrl;
      } else {
        alert("Billing-Portal konnte nicht geöffnet werden.");
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
      alert("Fehler beim Öffnen des Billing-Portals.");
    } finally {
      setIsBillingLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      // Force a complete page refresh to clear all state and show hero page
      window.location.href = '/';
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Abmeldung fehlgeschlagen.");
    }
  };

  const getPlanColor = (plan) => {
    const colors = {
      free: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      basic: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      pro: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
      team: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
    };
    return colors[plan] || colors.free;
  };

  const getPlanName = (accountType) => {
    return PLAN_NAMES[accountType] || "Kostenlos";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 p-6 flex items-center justify-center">
        <p className="text-gray-900 dark:text-white">Benutzer nicht gefunden.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kontoeinstellungen</h1>
            <p className="text-gray-600 dark:text-gray-300">Verwalten Sie Ihr Profil und Abonnement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    Profil Informationen
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Abbrechen' : 'Bearbeiten'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={user.profile_picture_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                        {user.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-upload"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full p-2"
                      onClick={() => document.getElementById('profile-upload')?.click()}
                      disabled={isUploadingImage}
                    >
                      <Camera className="w-3 h-3" />
                    </Button>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Profilbild</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Klicken Sie auf die Kamera, um ein neues Bild hochzuladen</p>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Vollständiger Name
                      </label>
                      <Input
                        value={editData.full_name}
                        onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Vor- und Nachname"
                        className="dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        E-Mail-Adresse
                      </label>
                      <Input
                        value={editData.email}
                        disabled
                        className="bg-gray-50 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">E-Mail kann nicht geändert werden.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                              Geplanter Prüfungstermin
                            </label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                                        <CalendarIcon className="mr-2 h-4 w-4 dark:text-gray-400" />
                                        {editData.test_date ? format(editData.test_date, 'PPP', { locale: de }) : <span>Datum auswählen</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600">
                                    <Calendar 
                                        mode="single" 
                                        selected={editData.test_date} 
                                        onSelect={(date) => setEditData(prev => ({...prev, test_date: date}))} 
                                        initialFocus
                                        className="dark:text-gray-200"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                              Prüfungsort
                            </label>
                            <Select 
                                value={editData.test_location} 
                                onValueChange={(value) => setEditData(prev => ({ ...prev, test_location: value }))}
                            >
                                <SelectTrigger className="w-full dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                                    <SelectValue placeholder="Ort auswählen" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600">
                                    <SelectItem value="Mainz">Mainz</SelectItem>
                                    <SelectItem value="Nürnberg">Nürnberg</SelectItem>
                                    <SelectItem value="Kassel">Kassel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dunkles Design</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Wechseln Sie zwischen hellem und dunklem Modus</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-gray-400" />
                        <Switch
                          checked={editData.dark_mode}
                          onCheckedChange={(checked) => setEditData(prev => ({...prev, dark_mode: checked}))}
                        />
                        <Moon className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Speichern...' : 'Änderungen speichern'}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1">{user.full_name || 'Nicht angegeben'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-Mail</label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rolle</label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        {user.role === 'admin' ? 'Professor' : 'Student'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mitglied seit</label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        {format(new Date(user.created_date), 'dd. MMMM yyyy', { locale: de })}
                      </p>
                    </div>
                     <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prüfungstermin</label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        {user.test_date ? format(new Date(user.test_date), 'dd. MMMM yyyy', { locale: de }) : 'Nicht festgelegt'}
                      </p>
                    </div>
                     <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prüfungsort</label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        {user.test_location || 'Nicht festgelegt'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Design</label>
                      <p className="text-lg text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                        {user.dark_mode ? <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <Sun className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                        {user.dark_mode ? 'Dunkler Modus' : 'Heller Modus'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

             {user.role !== 'admin' && (
                <Card className="mt-8 shadow-lg border-0 bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
                        Prüfungstermin
                    </CardTitle>
                    <CardDescription className="dark:text-gray-300">Lassen Sie Ihren Professor wissen, wann Ihre Prüfung stattfindet.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     {user.test_date ? (
                        <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center gap-3 dark:bg-green-900/20 dark:text-green-300">
                           <CheckCircle className="w-5 h-5"/>
                           <p>Ihr Prüfungstermin ist auf den <strong>{format(new Date(user.test_date), 'dd. MMMM yyyy', { locale: de })}</strong> festgelegt.</p>
                        </div>
                     ) : (
                        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg flex items-center gap-3 dark:bg-amber-900/20 dark:text-amber-300">
                           <Bell className="w-5 h-5"/>
                           <p>Sie haben noch keinen Prüfungstermin festgelegt. Klicken Sie auf "Bearbeiten", um einen hinzuzufügen.</p>
                        </div>
                     )}
                  </CardContent>
                </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Crown className="w-5 h-5 text-amber-500" />
                  Abonnement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge className={`${getPlanColor(getEffectiveAccountType(user))} text-lg px-4 py-2`}>
                    {getPlanName(getEffectiveAccountType(user))} Plan
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {getEffectiveAccountType(user) !== 'free' ? 'Aktiv' : 'Kostenlos'}
                    </span>
                  </div>
                  
                  {user.plan_expiry && (
                    <div className="flex justify-between">
                      <span>Läuft ab:</span>
                      <span>{format(new Date(user.plan_expiry), 'dd.MM.yyyy', { locale: de })}</span>
                    </div>
                  )}
                  
                  {getEffectiveAccountType(user) !== 'free' && (
                    <div className="flex justify-between">
                      <span>Verbleibende Tage:</span>
                      <span>{getDaysRemaining(user)} Tage</span>
                    </div>
                  )}
                </div>

                <Link to={createPageUrl("Upgrade")}>
                  <Button className="w-full">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Plan upgraden
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Statistiken</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Level:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{user.level || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Titel:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{user.title || 'Neuling'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Gesamt XP:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{user.xp || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Heute verdient:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{user.daily_xp || 0} XP</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Konto-Aktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                  onClick={() => navigate(createPageUrl("Upgrade"))}
                >
                  Plan upgraden
                </Button>
                
                <Separator className="dark:bg-gray-600" />
                
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Abmelden
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
