import { ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
  onBack?: () => void;
}

export default function Header({ 
  title, 
  showBack = false, 
  showSettings = false,
  onBack 
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {showSettings && (
            <button 
              onClick={() => navigate('/profile')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}