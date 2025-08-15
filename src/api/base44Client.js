// Mock client to replace Base44 functionality
// This provides the same interface but works locally

export const mockClient = {
  entities: {
    User: {
      me: () => {
        const savedUser = localStorage.getItem('famedUser');
        return savedUser ? JSON.parse(savedUser) : null;
      }
    },
    SpeechAssessment: {
      create: (data) => ({ id: Date.now(), ...data }),
      findMany: () => [],
      findById: (id) => ({ id, title: 'Mock Assessment' })
    },
    Flashcard: {
      create: (data) => ({ id: Date.now(), ...data }),
      findMany: () => [],
      findById: (id) => ({ id, question: 'Mock Question' })
    },
    MedicalCase: {
      create: (data) => ({ id: Date.now(), ...data }),
      findMany: () => [],
      findById: (id) => ({ id, title: 'Mock Case' })
    }
  }
};

// Export as base44 to maintain compatibility
export const base44 = mockClient;
