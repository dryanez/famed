import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { STRIPE_CONFIG } from '../components/utils/subscriptionLimits';

// This verification MUST eventually be moved to a secure backend.
// Exposing a secret key on the client-side is insecure for a production app.
const verifyStripeSessionOnClient = async (sessionId) => {
  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STRIPE_CONFIG.SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to verify payment with Stripe');
    }

    const session = await response.json();
    
    if (session.payment_status !== 'paid') {
      throw new Error('Payment was not successful.');
    }
    
    return { success: true };

  } catch (error) {
    console.error('Stripe verification error:', error);
    return { success: false, error: error.message };
  }
};


export default function PaymentSuccess() {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('session_id');
    const planId = queryParams.get('plan_id'); // KEY FIX: Get planId from the URL

    if (!sessionId || !planId) {
      setStatus('error');
      setError('Sitzungs- oder Planinformationen fehlen. Zahlung kann nicht überprüft werden.');
      return;
    }

    grantAccessAfterVerification(sessionId, planId);
  }, [location]);

  const grantAccessAfterVerification = async (sessionId, planId) => {
    setStatus('loading');
    
    const verification = await verifyStripeSessionOnClient(sessionId);

    if (verification.success) {
      try {
        const expiryDate = new Date();
        if (planId === 'test_plan' || planId === 'paid_1m') {
          expiryDate.setDate(expiryDate.getDate() + 30);
        } else if (planId === 'paid_3m') {
          expiryDate.setDate(expiryDate.getDate() + 90);
        } else {
            throw new Error(`Ungültige Plan-ID: ${planId}`);
        }

        await User.updateMyUserData({
          account_type: planId,
          plan_expiry: expiryDate.toISOString().split('T')[0],
        });
        
        setStatus('success');
      } catch (userUpdateError) {
        setStatus('error');
        setError('Zahlung bestätigt, aber Ihr Konto konnte nicht aktualisiert werden. Bitte kontaktieren Sie den Support.');
        console.error('User update error:', userUpdateError);
      }
    } else {
      setStatus('error');
      setError(verification.error || 'Ein unbekannter Fehler ist bei der Überprüfung aufgetreten.');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <RefreshCw className="w-12 h-12 mx-auto animate-spin text-blue-600 mb-4" />
            <p className="text-lg text-gray-700 dark:text-gray-300">Ihre Zahlung wird überprüft...</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <CardTitle className="text-2xl font-bold mb-2">Zahlung erfolgreich!</CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Ihr Plan wurde aktiviert. Vielen Dank!</p>
            <Button asChild size="lg">
              <Link to={createPageUrl("Dashboard")}>Zum Dashboard</Link>
            </Button>
          </div>
        );
      case 'error':
        return (
          <div className="text-center">
            <XCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
            <CardTitle className="text-2xl font-bold mb-2">Fehler bei der Zahlung</CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Es gab ein Problem bei der Überprüfung Ihrer Zahlung:
            </p>
            <p className="text-sm text-red-700 bg-red-50 p-3 rounded-md mb-6">{error}</p>
            <Button asChild variant="outline">
              <Link to={createPageUrl("Upgrade")}>Zurück zu den Plänen</Link>
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-6 flex items-center justify-center">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader />
        <CardContent className="p-8">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}