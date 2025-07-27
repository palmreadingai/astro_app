import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, PalmAnalysis, Kundli, ChatMessage } from '../types';

interface AppState {
  user: User | null;
  currentScreen: string;
  authMode: 'signin' | 'signup';
  palmAnalyses: PalmAnalysis[];
  kundlis: Kundli[];
  chatHistory: ChatMessage[];
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_SCREEN'; payload: string }
  | { type: 'SET_AUTH_MODE'; payload: 'signin' | 'signup' }
  | { type: 'ADD_PALM_ANALYSIS'; payload: PalmAnalysis }
  | { type: 'ADD_KUNDLI'; payload: Kundli }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  user: null,
  currentScreen: 'landing',
  authMode: 'signup',
  palmAnalyses: [],
  kundlis: [],
  chatHistory: [],
  isLoading: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload };
    case 'SET_AUTH_MODE':
      return { ...state, authMode: action.payload };
    case 'ADD_PALM_ANALYSIS':
      return { ...state, palmAnalyses: [...state.palmAnalyses, action.payload] };
    case 'ADD_KUNDLI':
      return { ...state, kundlis: [...state.kundlis, action.payload] };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}