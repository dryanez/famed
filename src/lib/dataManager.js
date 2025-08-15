// Real Local Data Management System
// This replaces Base44 API with localStorage-based data persistence

class DataManager {
  constructor() {
    this.storage = window.localStorage;
    this.initializeData();
  }

  // Initialize default data structure
  initializeData() {
    const defaultData = {
      users: {},
      flashcards: [],
      userFlashcardMastery: [],
      speechAssessments: [],
      userProgress: {},
      aufklaerungCases: []
    };

    // Check if data exists, if not create it
    Object.keys(defaultData).forEach(key => {
      if (!this.storage.getItem(key)) {
        this.storage.setItem(key, JSON.stringify(defaultData[key]));
      }
    });
  }

  // Generic CRUD operations
  create(tableName, data) {
    const items = this.getAll(tableName);
    const newItem = {
      ...data,
      id: this.generateId(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
    items.push(newItem);
    this.storage.setItem(tableName, JSON.stringify(items));
    return newItem;
  }

  getAll(tableName) {
    const data = this.storage.getItem(tableName);
    return data ? JSON.parse(data) : [];
  }

  get(tableName, id) {
    const items = this.getAll(tableName);
    return items.find(item => item.id === id);
  }

  update(tableName, id, updates) {
    const items = this.getAll(tableName);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updates,
        updated_date: new Date().toISOString()
      };
      this.storage.setItem(tableName, JSON.stringify(items));
      return items[index];
    }
    return null;
  }

  delete(tableName, id) {
    const items = this.getAll(tableName);
    const filtered = items.filter(item => item.id !== id);
    this.storage.setItem(tableName, JSON.stringify(filtered));
    return true;
  }

  filter(tableName, conditions = {}, sortBy = null) {
    let items = this.getAll(tableName);
    
    // Apply filters
    Object.entries(conditions).forEach(([key, value]) => {
      if (typeof value === 'object' && value.$in) {
        items = items.filter(item => value.$in.includes(item[key]));
      } else {
        items = items.filter(item => item[key] === value);
      }
    });

    // Apply sorting
    if (sortBy) {
      const isDesc = sortBy.startsWith('-');
      const field = isDesc ? sortBy.substring(1) : sortBy;
      items.sort((a, b) => {
        const aVal = a[field] || 0;
        const bVal = b[field] || 0;
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return isDesc ? -comparison : comparison;
      });
    }

    return items;
  }

  generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // User-specific methods
  getCurrentUser() {
    const userData = this.storage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }

  updateCurrentUser(updates) {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.storage.setItem('currentUser', JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  }

  // Flashcard-specific methods
  getUserFlashcards(userEmail) {
    return this.filter('flashcards', { created_by: userEmail });
  }

  getFlashcardMastery(userEmail, flashcardIds = []) {
    const conditions = { user_email: userEmail };
    if (flashcardIds.length > 0) {
      conditions.flashcard_id = { $in: flashcardIds };
    }
    return this.filter('userFlashcardMastery', conditions);
  }

  updateFlashcardMastery(userEmail, flashcardId, masteryLevel) {
    const existing = this.filter('userFlashcardMastery', {
      user_email: userEmail,
      flashcard_id: flashcardId
    });

    if (existing.length > 0) {
      return this.update('userFlashcardMastery', existing[0].id, {
        mastery_level: masteryLevel
      });
    } else {
      return this.create('userFlashcardMastery', {
        user_email: userEmail,
        flashcard_id: flashcardId,
        mastery_level: masteryLevel
      });
    }
  }

  // Speech Assessment methods
  createSpeechAssessment(assessmentData) {
    return this.create('speechAssessments', assessmentData);
  }

  getUserAssessments(userEmail) {
    return this.filter('speechAssessments', { created_by: userEmail }, '-created_date');
  }

  // Initialize with sample data if empty
  seedSampleData() {
    // System flashcards
    const systemCards = [
      {
        german_text: 'Anamnese',
        english_translation: 'Medical History',
        category: 'vocabulary',
        deck: 'Gastrointestinales System',
        difficulty: 'beginner',
        example_sentence: 'Die Anamnese des Patienten ist sehr wichtig.',
        created_by: 'system'
      },
      {
        german_text: 'Verschreiben',
        english_translation: 'To prescribe',
        category: 'grammar',
        deck: 'Gastrointestinales System',
        difficulty: 'intermediate',
        example_sentence: 'Ich muss Ihnen ein Medikament verschreiben.',
        created_by: 'system'
      },
      {
        german_text: 'Röntgenaufnahme',
        english_translation: 'X-ray image',
        category: 'pronunciation',
        deck: 'Respiratorisches System',
        difficulty: 'advanced',
        example_sentence: 'Die Röntgenaufnahme zeigt eine Pneumonie.',
        created_by: 'system'
      },
      {
        german_text: 'Blutdruck messen',
        english_translation: 'Measure blood pressure',
        category: 'phrases',
        deck: 'Kardiovaskuläres System',
        difficulty: 'beginner',
        example_sentence: 'Ich werde jetzt Ihren Blutdruck messen.',
        created_by: 'system'
      },
      {
        german_text: 'Herzinsuffizienz',
        english_translation: 'Heart failure',
        category: 'vocabulary',
        deck: 'Kardiovaskuläres System',
        difficulty: 'advanced',
        example_sentence: 'Der Patient leidet an einer Herzinsuffizienz.',
        created_by: 'system'
      }
    ];

    const existingCards = this.getAll('flashcards');
    if (existingCards.length === 0) {
      systemCards.forEach(card => this.create('flashcards', card));
      console.log('Sample flashcard data seeded');
    }
  }
}

// Export singleton instance
export const dataManager = new DataManager();

// Initialize sample data
dataManager.seedSampleData();
