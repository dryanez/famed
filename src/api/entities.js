// Real API Layer - Replaces Base44 entities with local data management
import { dataManager } from '../lib/dataManager.js';

export class User {
  static async me() {
    // Get current user from auth context (stored in localStorage during login)
    const currentUser = dataManager.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return currentUser;
  }

  static async updateMyUserData(updates) {
    const updatedUser = dataManager.updateCurrentUser(updates);
    if (!updatedUser) {
      throw new Error('Failed to update user data');
    }
    return updatedUser;
  }

  static async list(sortBy = null, limit = null) {
    // For leaderboards and admin functions
    let users = dataManager.getAll('users');
    
    if (sortBy) {
      const isDesc = sortBy.startsWith('-');
      const field = isDesc ? sortBy.substring(1) : sortBy;
      users.sort((a, b) => {
        const aVal = a[field] || 0;
        const bVal = b[field] || 0;
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return isDesc ? -comparison : comparison;
      });
    }

    if (limit) {
      users = users.slice(0, limit);
    }

    return users;
  }
}

export class Flashcard {
  static async create(data) {
    return dataManager.create('flashcards', data);
  }

  static async get(id) {
    return dataManager.get('flashcards', id);
  }

  static async update(id, updates) {
    return dataManager.update('flashcards', id, updates);
  }

  static async delete(id) {
    return dataManager.delete('flashcards', id);
  }

  static async filter(conditions = {}, sortBy = null) {
    return dataManager.filter('flashcards', conditions, sortBy);
  }

  static async list(sortBy = null) {
    return dataManager.filter('flashcards', {}, sortBy);
  }
}

export class UserFlashcardMastery {
  static async create(data) {
    return dataManager.create('userFlashcardMastery', data);
  }

  static async filter(conditions = {}) {
    return dataManager.filter('userFlashcardMastery', conditions);
  }

  static async update(id, updates) {
    return dataManager.update('userFlashcardMastery', id, updates);
  }

  static async delete(id) {
    return dataManager.delete('userFlashcardMastery', id);
  }
}

export const SpeechAssessment = {
  async create(data) {
    return dataManager.createSpeechAssessment(data);
  },

  async filter(conditions = {}, sortBy = null) {
    return dataManager.filter('speechAssessments', conditions, sortBy);
  },

  async get(id) {
    return dataManager.get('speechAssessments', id);
  }
};

export const InformedConsentCase = {
  async get(id) {
    // Use our real medical case data
    const cases = dataManager.getAll('aufklaerungCases');
    let case_item = cases.find(c => c.id === id);
    
    if (!case_item) {
      // Create from our medical data if not exists
      const medicalCases = [
        { id: 'sigmoidektomie', title: 'Sigmoidektomie', category: 'Chirurgie' },
        { id: 'cholezystektomie', title: 'Cholezystektomie', category: 'Chirurgie' },
        { id: 'mastoidektomie', title: 'Mastoidektomie', category: 'HNO' },
        { id: 'oesophagogastroduodenoskopie', title: 'Ösophagogastroduodenoskopie', category: 'Gastroenterologie' },
        { id: 'koloskopie', title: 'Koloskopie', category: 'Gastroenterologie' },
        { id: 'koronarangiographie', title: 'Koronarangiographie', category: 'Kardiologie' },
        { id: 'arthroskopie', title: 'Arthroskopie', category: 'Orthopädie' },
        { id: 'tee', title: 'TEE', category: 'Kardiologie' }
      ];

      case_item = medicalCases.find(c => c.id === id);
      if (case_item) {
        // Store in our data manager
        case_item = dataManager.create('aufklaerungCases', case_item);
      }
    }

    if (!case_item) {
      throw new Error('Case not found');
    }

    return case_item;
  },

  async list() {
    return dataManager.getAll('aufklaerungCases');
  }
};

// Additional entities for compatibility
export const MedicalCase = {
  async list() {
    return dataManager.getAll('medicalCases');
  }
};

export const Assignment = {
  async filter(conditions = {}) {
    return dataManager.filter('assignments', conditions);
  }
};

export const Submission = {
  async filter(conditions = {}) {
    return dataManager.filter('submissions', conditions);
  }
};

export const Class = {
  async list() {
    return dataManager.getAll('classes');
  }
};

export const Course = {
  async list() {
    return dataManager.getAll('courses');
  }
};

export const UsageCounter = {
  async filter(conditions = {}) {
    return dataManager.filter('usageCounters', conditions);
  }
};

export const AccessCode = base44.entities.AccessCode;

export const ExamReport = base44.entities.ExamReport;



// auth sdk:
export const User = base44.auth;