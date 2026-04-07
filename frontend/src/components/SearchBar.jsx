import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, X } from 'lucide-react';

const TYPING_EXAMPLES = [
  'Tìm khách sạn gần Quận 1, không gian yên tĩnh...',
  'Quán ăn ngon, không gian lãng mạn...',
  'Địa điểm vui chơi cho gia đình...',
  'Spa thư giãn, dịch vụ tốt...',
  'Nhà hàng hải sản, giá bình dân...',
  'Quán cà phê view đẹp, yên tĩnh...',
];

export default function SearchBar({ onSearch, isLoading, filterNode }) {
  const [query, setQuery] = useState('');
  const [typingText, setTypingText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const inputRef = useRef(null);

  // Typing animation effect
  useEffect(() => {
    if (query) return; // Stop typing animation when user types

    const currentExample = TYPING_EXAMPLES[typingIndex];
    
    if (isTyping) {
      if (charIndex < currentExample.length) {
        const timer = setTimeout(() => {
          setTypingText(currentExample.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 80);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setIsTyping(false), 2000);
        return () => clearTimeout(timer);
      }
    } else {
      if (charIndex > 0) {
        const timer = setTimeout(() => {
          setTypingText(currentExample.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 40);
        return () => clearTimeout(timer);
      } else {
        setTypingIndex((prev) => (prev + 1) % TYPING_EXAMPLES.length);
        setIsTyping(true);
      }
    }
  }, [query, typingIndex, charIndex, isTyping]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query.trim());
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative z-50">
      <form onSubmit={handleSubmit}>
        <motion.div
          className="relative flex items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={typingText || 'Nhập yêu cầu của bạn...'}
            onKeyDown={handleKeyDown}
            className="w-full pl-12 pr-32 py-4 text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all shadow-lg hover:shadow-xl"
            disabled={isLoading}
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2">
            {query && (
              <motion.button
                type="button"
                onClick={clearQuery}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            {filterNode}
          </div>
        </motion.div>
      </form>

      {/* Example Queries */}
      <motion.div
        className="flex flex-wrap gap-2 mt-4 justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-sm text-gray-500">Ví dụ:</span>
        {['Khách sạn yên tĩnh', 'Quán ăn ngon', 'Spa thư giãn', 'Cà phê view đẹp'].map((example, index) => (
          <motion.button
            key={example}
            onClick={() => {
              setQuery(example);
              onSearch(example);
            }}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {example}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
