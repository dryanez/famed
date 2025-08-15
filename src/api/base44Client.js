import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a mock client for local development to prevent redirects
export const base44 = {
  entities: {
    User: {
      me: () => Promise.resolve(null)
    },
    Class: {
      get: () => Promise.resolve(null)
    },
    SpeechAssessment: {},
    Flashcard: {},
    MedicalCase: {},
    Appointment: {},
    Course: {},
    Enrollment: {},
    Certificate: {},
    Assignment: {},
    Usage: {}
  },
  integrations: {
    Core: {
      InvokeLLM: () => Promise.resolve({}),
      SendEmail: () => Promise.resolve({}),
      UploadFile: () => Promise.resolve({}),
      GenerateImage: () => Promise.resolve({}),
      ExtractDataFromUploadedFile: () => Promise.resolve({})
    }
  }
};

// For production, uncomment this:
// export const base44 = createClient({
//   appId: "687e890e3a2296d07bac8718", 
//   requiresAuth: true
// });
