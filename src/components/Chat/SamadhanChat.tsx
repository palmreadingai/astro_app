import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Hand, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { sendMessage, startNewChat, loadChatHistory, checkMessageLimit } from '../../services/chatService';
import { usePayment } from '../../context/PaymentContext';
import { usePalmAnalysis } from '../../hooks/usePalmAnalysis';
import Breadcrumb from '../Layout/Breadcrumb';
import PaymentRequiredModal from '../Common/PaymentRequiredModal';
import { useNavigate } from 'react-router-dom';

export default function SamadhanChat() {
  const { chatHistory } = useAppStore();
  const { hasPaid, isLoading: isCheckingPayment } = usePayment();
  const { palmAnalysis, checkAndLoadAnalysis } = usePalmAnalysis();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [checkingPalmAnalysis, setCheckingPalmAnalysis] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewChatConfirm, setShowNewChatConfirm] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [messageLimit, setMessageLimit] = useState({ currentCount: 0, dailyLimit: 10, canSendMessage: true });
  const [loadingLimit, setLoadingLimit] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessageLimit = async () => {
    setLoadingLimit(true);
    try {
      const limitStatus = await checkMessageLimit();
      if (limitStatus.success) {
        setMessageLimit({
          currentCount: limitStatus.currentCount,
          dailyLimit: limitStatus.dailyLimit,
          canSendMessage: limitStatus.canSendMessage
        });
      }
    } catch (error) {
      console.error('Error loading message limit:', error);
    } finally {
      setLoadingLimit(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Check payment status - if not paid, show modal
        if (!hasPaid && !isCheckingPayment) {
          setShowPaymentModal(true);
          setCheckingPalmAnalysis(false);
          return;
        }

        // If still checking payment, wait
        if (isCheckingPayment) {
          return;
        }

        // Payment verified, continue with chat initialization
        // If we already have analysis in global state, no need to check server
        if (palmAnalysis) {
          setCheckingPalmAnalysis(false);
          // Load existing chat history
          await loadChatHistory();
          // Load message limits
          await loadMessageLimit();
          return;
        }

        // Check server for existing analysis using centralized hook
        await checkAndLoadAnalysis();
        setCheckingPalmAnalysis(false);
        
        // Load existing chat history after palm analysis check
        await loadChatHistory();
        
        // Load message limits
        await loadMessageLimit();
      } catch (error) {
        console.error('Error initializing chat:', error);
        setCheckingPalmAnalysis(false);
      }
    };

    initializeChat();
  }, [palmAnalysis, navigate, hasPaid, isCheckingPayment]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isTyping || !messageLimit.canSendMessage) return;

    const messageToSend = message;
    setMessage('');
    setIsTyping(true);
    setError(null);

    try {
      const result = await sendMessage(messageToSend);
      
      if (!result.success) {
        if (result.limitReached) {
          // Update limit state immediately
          setMessageLimit(prev => ({
            ...prev,
            canSendMessage: false,
            currentCount: result.currentCount || prev.dailyLimit
          }));
        }
        setError(result.error || 'Failed to send message');
      } else {
        // Optimistic update - increment counter immediately
        setMessageLimit(prev => ({
          ...prev,
          currentCount: prev.currentCount + 1,
          canSendMessage: (prev.currentCount + 1) < prev.dailyLimit
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setShowNewChatConfirm(true);
  };

  const confirmNewChat = async () => {
    setShowNewChatConfirm(false);
    setIsTyping(true);
    setError(null);

    try {
      // Clear local state immediately to prevent flashing of old messages
      useAppStore.getState().setChatHistory([]);
      
      const result = await startNewChat();
      
      if (!result.success) {
        setError(result.error || 'Failed to start new chat');
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    'What does my heart line mean?',
    'Will I find love soon?',
    'How is my career looking?',
    'What should I focus on this month?',
    'Any health concerns to watch?',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/3 left-1/6 w-3 h-3 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="absolute top-1/4 right-1/6 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-cyan-300 rounded-full animate-bounce opacity-70"></div>
      </div>

      <Breadcrumb
        items={[
          { label: 'Home', path: '/home' },
          { label: 'Chat' }
        ]}
      />

      {/* Conditional Content Based on Palm Analysis Status */}
      {checkingPalmAnalysis ? (
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <p className="text-white">Checking your palm analysis...</p>
          </div>
        </div>
      ) : !palmAnalysis ? (
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Hand className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Palm Analysis Required</h3>
            <p className="text-purple-200 mb-6 leading-relaxed">
              To provide you with personalized astrological insights, please complete your palm analysis first. 
              Our AI needs to understand your unique palm patterns to give you accurate guidance.
            </p>
            <button
              onClick={() => navigate('/palm')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
            >
              Start Palm Analysis
            </button>
          </div>
        </div>
      ) : (
        /* Chat Container - Relative positioning for contained overlay */
        <div className="relative h-[calc(100vh-80px)] z-10">
        
        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}
        
        {/* Chat Messages - Full height scrollable background */}
        <div className="h-full overflow-y-auto scrollbar-hide px-6 py-4 pb-32 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Welcome to Samadhan</h3>
              <p className="text-purple-200 mb-6">Ask me anything about your palmistry, kundli, or astrology in general</p>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-300 mb-3">Quick questions to get started:</p>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(question)}
                    className="block w-full text-left p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:border-purple-400 hover:bg-white/20 transition-all text-sm text-white"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${
                    msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`flex-1 max-w-xs ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`p-3 rounded-2xl backdrop-blur-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
                        : 'bg-white/10 border border-white/20 text-white rounded-bl-md'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    <p className="text-xs text-purple-300 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl rounded-bl-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Overlayed Input Window - Floating container */}
        <div className="absolute bottom-1 left-6 right-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-lg">
            {/* Message Counter - Left aligned */}
            {!loadingLimit && (
              <div className="flex justify-start mb-2">
                <span className="text-xs text-purple-200 bg-white/10 px-3 py-1 rounded-lg">
                  <span className="font-semibold">{messageLimit.currentCount}/{messageLimit.dailyLimit}</span>
                  <span className="hidden sm:inline"> messages</span>
                  <span> today</span>
                </span>
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="flex items-center space-x-0 md:space-x-4 w-full">
              {/* New Chat Button - Inside input window */}
              {chatHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleNewChat}
                  disabled={isTyping}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className={`text-sm transition-all duration-200 ${isInputFocused ? 'md:block hidden' : 'block'}`}>New Chat</span>
                </button>
              )}
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder={!messageLimit.canSendMessage ? "Daily limit reached" : "Ask me anything about your destiny..."}
                  className={`w-full px-4 py-3 bg-transparent border-0 focus:ring-0 focus:outline-none transition-all placeholder:text-purple-300 text-white ${!messageLimit.canSendMessage ? 'opacity-50' : ''}`}
                  disabled={isTyping || !messageLimit.canSendMessage}
                />
              </div>
              <button
                type="submit"
                disabled={!message.trim() || isTyping || !messageLimit.canSendMessage}
                className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
        </div>
      )}

      {/* New Chat Confirmation Modal */}
      {showNewChatConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Start New Chat?</h3>
              <p className="text-purple-200 mb-6 leading-relaxed">
                This will clear your current conversation history and start fresh. Your previous messages will be lost permanently.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowNewChatConfirm(false)}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmNewChat}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl transition-all"
                >
                  Start New
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Required Modal */}
      <PaymentRequiredModal 
        isOpen={showPaymentModal}
        title="Premium Chat Access"
        message="Chat with our AI astrologer and get personalized insights about your palm reading and destiny. Unlock unlimited chat sessions with lifetime access!"
        feature="AI chat sessions"
      />
    </div>
  );
}