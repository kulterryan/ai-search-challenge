'use client';

import { useQueryState } from 'nuqs';
import { Search, ChevronDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { SearchResults } from './SearchResults';
import { searchHandler } from '@/utils/search';

// Define type for grade options
type GradeOptionType = {
  id: number;
  label: string;
  value: string;
};

// Fixture data for grade options
const gradeOptions: GradeOptionType[] = [
  { id: 0, label: 'All Grades', value: 'all' },
  { id: 1, label: 'Kindergarten', value: 'K' },
  { id: 2, label: 'Grade 1', value: '1' },
  { id: 3, label: 'Grade 2', value: '2' },
  { id: 4, label: 'Grade 3', value: '3' },
  { id: 5, label: 'Grade 4', value: '4' },
  { id: 6, label: 'Grade 5', value: '5' },
  { id: 7, label: 'Grade 6', value: '6' },
  { id: 8, label: 'Grade 7', value: '7' },
  { id: 9, label: 'Grade 8', value: '8' },
  { id: 10, label: 'Grade 9', value: '9' },
  { id: 11, label: 'Grade 10', value: '10' },
  { id: 12, label: 'Grade 11', value: '11' },
  { id: 13, label: 'Grade 12', value: '12' },
];

// Placeholder search agent actions
// const searchAgentActions = ['Looking through PBSMedia, IXL, Khan Academy, and 4 other sites...', 'Looking through 14 results on PBSMedia...', 'Found 3 high quality resources on PBSMedia...', 'Looking...'];

// Search interface component
export const SearchInterface = () => {
  const [query, setQuery] = useQueryState('query', { defaultValue: '' });
  const [grade, setGrade] = useQueryState('grade', { defaultValue: 'all' });
  const [searchProgress, setSearchProgress] = useState(false);
  const [searchAgentActions, setSearchAgentActions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if query is empty
    if (!query || query.trim() === '') {
      setSearchError("Please enter a search term");
      setSearchResults([]);
      return;
    }

    // Clear any existing actions first
    setSearchProgress(true);
    setSearchAgentActions([]);
    setSearchResults([]);
    setSearchError(null);

    // Fetch search results
    const data = await searchHandler(query, grade, searchAgentActions);

    // Add actions step by step with timeouts
    // Define all messages with their timing
    const messages = [
      { message: 'Looking through PBSMedia, IXL, Khan Academy, and 4 other sites...', delay: 500 },
      { message: 'Looking through 14 results on PBSMedia...', delay: 1500 }, // 500 + 1000
      { message: 'Found 3 high quality resources on PBSMedia...', delay: 2700 }, // 500 + 1000 + 1200
      { message: 'Finalizing content...', delay: 3500 }, // 500 + 1000 + 1200 + 800
    ];

    // Set up each message with its own timeout
    messages.forEach(({ message, delay }) => {
      const timer = setTimeout(() => {
        setSearchAgentActions((prev) => [...prev, message]);
      }, delay);

      // Clean up timers if component unmounts
      return () => clearTimeout(timer);
    });

    setSearchResults(data.searchResults);
    setSearchProgress(false);
  };

  return (
    <div className="px-4 flex-1 w-full mb-2">
      <div className="flex items-center bg-[#f2f2f7] rounded-lg shadow-sm border border-[#e5e5ea] transition-all duration-200 focus-within:ring-1 focus-within:ring-[#8e8e93] overflow-hidden mb-2">
        <input type="text" placeholder="Volcanoes..." defaultValue={query} onChange={(e) => setQuery(e.target.value)} onSubmit={(e) => handleSubmit(e)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)} className="flex-grow h-12 pl-4 bg-transparent text-base text-[#1c1c1e] placeholder:text-[#8e8e93] focus:outline-none" />
        <button type="submit" onClick={(e) => handleSubmit(e)} aria-label="Search" className={'bg-[#1c1c1e] text-white w-12 h-12 flex items-center justify-center hover:bg-[#3a3a3c] transition duration-200' + (!query ? ' cursor-not-allowed bg-gray-700' : '')}>
            {searchProgress ? (
            <div className="animate-spin">
              <Loader2 className="w-5 h-5" />
            </div>
            ) : (
              <Search className="w-5 h-5" />
            )}
        </button>
      </div>

      <div className="flex justify-start mb-6">
        <div className="relative">
          <select defaultValue={grade} onChange={(e) => setGrade(e.target.value)} className="appearance-none h-8 pl-3 pr-8 bg-[#f2f2f7] rounded-md text-sm text-[#1c1c1e] border border-[#e5e5ea] focus:outline-none focus:ring-1 focus:ring-[#8e8e93]">
            {gradeOptions.map((grade) => (
              <option key={grade.id} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-3 h-3 text-[#8e8e93]" />
          </div>
        </div>
      </div>
      {/* Search agent actions area */}
      {searchProgress && (
        <div className="w-[600px] max-w-full mb-10">
          <div className="rounded-lg border border-[#e5e5ea] bg-white p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-3 text-[#1c1c1e]">Astral is looking for resources...</h3>
            <div className="space-y-2.5">
              {searchAgentActions.map((action, index) => (
                <div key={index} className="text-[#3a3a3c] text-sm border-l-2 border-gray-200 pl-3 py-0.5">
                  {action}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search results area */}
      {searchResults.length > 0 && <SearchResults results={searchResults} />}

      {/* Welcome message when no search has been attempted */}
      {!searchProgress && searchResults.length === 0 && !searchError && (
        <div className="w-[600px] max-w-full mb-10">
          <div className="rounded-lg border border-[#e5e5ea] bg-white p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-3 text-[#1c1c1e]">Ready to search</h3>
            <p className="text-[#3a3a3c] text-sm">Enter a search term above to find educational resources.</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {searchError && (
        <div className="w-[600px] max-w-full mb-10">
          <div className="rounded-lg border border-red-500 bg-red-50 p-4">
            <h3 className="text-lg font-medium mb-3 text-red-700">Error</h3>
            <p className="text-red-600">{searchError}</p>
          </div>
        </div>
      )}
    </div>
  );
};
