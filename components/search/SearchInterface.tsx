'use client';

import { useQueryState } from 'nuqs';
import { Search, ChevronDown } from 'lucide-react';

// Define type for grade options
type GradeOptionType = {
  id: number;
  label: string;
  value: string;
};

// Fixture data for grade options
const gradeOptions: GradeOptionType[] = [
  { id: 0, label: "All Grades", value: "all" },
  { id: 1, label: "Kindergarten", value: "K" },
  { id: 2, label: "Grade 1", value: "1" },
  { id: 3, label: "Grade 2", value: "2" },
  { id: 4, label: "Grade 3", value: "3" },
  { id: 5, label: "Grade 4", value: "4" },
  { id: 6, label: "Grade 5", value: "5" },
  { id: 7, label: "Grade 6", value: "6" },
  { id: 8, label: "Grade 7", value: "7" },
  { id: 9, label: "Grade 8", value: "8" },
  { id: 10, label: "Grade 9", value: "9" },
  { id: 11, label: "Grade 10", value: "10" },
  { id: 12, label: "Grade 11", value: "11" },
  { id: 13, label: "Grade 12", value: "12" },
];

// Search interface component
export const SearchInterface = () => {
  const [query, setQuery] = useQueryState('query', { defaultValue: '' });
  const [grade, setGrade] = useQueryState('grade', { defaultValue: 'all' });
  
  return (
    <div className="px-4 flex-1 w-full mb-2">
      <div className="flex items-center bg-[#f2f2f7] rounded-lg shadow-sm border border-[#e5e5ea] transition-all duration-200 focus-within:ring-1 focus-within:ring-[#8e8e93] overflow-hidden mb-2">
        <input
          type="text"
          placeholder="Volcanoes..."
          defaultValue={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow h-12 pl-4 bg-transparent text-base text-[#1c1c1e] placeholder:text-[#8e8e93] focus:outline-none"
        />
        <button
          type="submit"
          className="bg-[#1c1c1e] text-white w-12 h-12 flex items-center justify-center hover:bg-[#3a3a3c] transition duration-200"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex justify-start mb-6">
        <div className="relative">
          <select 
            defaultValue={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="appearance-none h-8 pl-3 pr-8 bg-[#f2f2f7] rounded-md text-sm text-[#1c1c1e] border border-[#e5e5ea] focus:outline-none focus:ring-1 focus:ring-[#8e8e93]"
          >
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
    </div>
  );
};