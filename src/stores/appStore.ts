import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, PalmAnalysis, Kundli, ChatMessage, AnalysisData } from '../types';


interface AppState {
  // User & Auth
  user: User | null;
  authMode: 'signin' | 'signup';
  isLoading: boolean;
  
  // Data
  palmAnalysis: PalmAnalysis | null;
  kundlis: Kundli[];
  chatHistory: ChatMessage[];
  
  // Loading states
  isLoadingPalmAnalysis: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthMode: (mode: 'signin' | 'signup') => void;
  setLoading: (loading: boolean) => void;
  setPalmAnalysis: (analysis: PalmAnalysis | null) => void;
  setLoadingPalmAnalysis: (loading: boolean) => void;
  addKundli: (kundli: Kundli) => void;
  addChatMessage: (message: ChatMessage) => void;
  setChatHistory: (messages: ChatMessage[]) => void;
  clearUserData: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        authMode: 'signup',
        isLoading: false,
        palmAnalysis: null,
        kundlis: [],
        chatHistory: [],
        isLoadingPalmAnalysis: false,

        // Actions
        setUser: (user) => set({ user }),
        setAuthMode: (authMode) => set({ authMode }),
        setLoading: (isLoading) => set({ isLoading }),
        
        setPalmAnalysis: (analysis) => 
          set({ palmAnalysis: analysis }),
          
        setLoadingPalmAnalysis: (loading) => 
          set({ isLoadingPalmAnalysis: loading }),
          
        addKundli: (kundli) => 
          set((state) => ({ 
            kundlis: [...state.kundlis, kundli] 
          })),
          
        addChatMessage: (message) => 
          set((state) => ({ 
            chatHistory: [...state.chatHistory, message] 
          })),
          
        setChatHistory: (messages) => 
          set({ chatHistory: messages }),
          
        clearUserData: () => 
          set({ 
            palmAnalysis: null, 
            kundlis: [], 
            chatHistory: []
          }),
          
        logout: () => 
          set({ 
            user: null,
            palmAnalysis: null, 
            kundlis: [], 
            chatHistory: []
          }),
      }),
      {
        name: 'astro-app-storage',
        partialize: (state) => ({
          user: state.user,
          palmAnalysis: state.palmAnalysis,
          kundlis: state.kundlis,
          chatHistory: state.chatHistory,
        }),
      }
    ),
    { name: 'astro-app-store' }
  )
);