import { useState, useEffect } from 'react';
import { User, UsageCounter } from '@/api/entities';
import { getCurrentWeekMondayISO, getEffectiveAccountType, LIMITS } from '../utils/subscriptionLimits';

export const useUsageCounter = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    User.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const checkUsage = async (sectionKey, type = 'speech') => {
    if (!user) return { allowed: false, reason: 'Not authenticated' };

    const effectiveType = getEffectiveAccountType(user);
    const limits = LIMITS[effectiveType];
    const weekStartISO = getCurrentWeekMondayISO();

    try {
      // Get or create usage counter
      let counters = await UsageCounter.filter({
        userId: user.id,
        sectionKey,
        weekStartISO
      });

      let counter;
      if (counters.length === 0) {
        counter = await UsageCounter.create({
          userId: user.id,
          sectionKey,
          weekStartISO,
          speechCount: 0,
          casesOpened: 0,
          lifetimeCasesOpened: 0,
          anamneseCount: 0,
          aufklarungCount: 0
        });
      } else {
        counter = counters[0];
      }

      // Check limits based on type
      switch (type) {
        case 'speech':
          if (effectiveType === 'free' && counter.speechCount >= limits.weeklySpeechPerSection) {
            return { 
              allowed: false, 
              reason: 'Weekly speech limit reached',
              counter 
            };
          }
          break;

        case 'case':
          if (effectiveType === 'free' && counter.lifetimeCasesOpened >= limits.casesPerSystem) {
            return { 
              allowed: false, 
              reason: 'Case limit reached for this system',
              counter 
            };
          }
          break;

        case 'anamnese':
          if (effectiveType === 'free' && counter.anamneseCount >= limits.anamneseAllowed) {
            return { 
              allowed: false, 
              reason: 'Anamnese session limit reached',
              counter 
            };
          }
          break;

        case 'aufklarung':
          if (effectiveType === 'free' && counter.aufklarungCount >= limits.aufklarungAllowed) {
            return { 
              allowed: false, 
              reason: 'Aufklärung session limit reached',
              counter 
            };
          }
          break;

        default:
          return { allowed: true, counter };
      }

      return { allowed: true, counter };

    } catch (error) {
      console.error('Error checking usage:', error);
      return { allowed: false, reason: 'Error checking usage limits' };
    }
  };

  const incrementUsage = async (sectionKey, type = 'speech') => {
    if (!user) return false;

    const weekStartISO = getCurrentWeekMondayISO();

    try {
      let counters = await UsageCounter.filter({
        userId: user.id,
        sectionKey,
        weekStartISO
      });

      if (counters.length === 0) return false;
      
      const counter = counters[0];
      const updates = {};

      switch (type) {
        case 'speech':
          updates.speechCount = (counter.speechCount || 0) + 1;
          break;
        case 'case':
          updates.casesOpened = (counter.casesOpened || 0) + 1;
          updates.lifetimeCasesOpened = (counter.lifetimeCasesOpened || 0) + 1;
          break;
        case 'anamnese':
          updates.anamneseCount = (counter.anamneseCount || 0) + 1;
          break;
        case 'aufklarung':
          updates.aufklarungCount = (counter.aufklarungCount || 0) + 1;
          break;
      }

      await UsageCounter.update(counter.id, updates);
      return true;

    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  };

  return {
    user,
    loading,
    checkUsage,
    incrementUsage,
    effectiveAccountType: getEffectiveAccountType(user)
  };
};