import { SearchInterface } from '@/components/search/SearchInterface';
import { createClient } from '@/utils/supabase/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
// import Image from 'next/image';

export const metadata : Metadata = {
  title: 'Astral Take Home Challenge'
}

// Define types for search results
type SearchResultType = {
  id: number;
  title: string;
  description: string;
  image: string;
  type: string;
};

// Placeholder search agent actions
const searchAgentActions = [
  "Looking through PBSMedia, IXL, Khan Academy, and 4 other sites...",
  "Looking through 14 results on PBSMedia...",
  "Found 3 high quality resources on PBSMedia...",
  "Looking..."
];



// Fixture data for search results
const searchResults: SearchResultType[] = [
  {
    id: 1,
    title: "Volcanic Eruptions and Their Impact on Climate",
    description: "Learn about how volcanic eruptions affect global climate patterns through the release of ash, gases, and aerosols into the atmosphere.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa0tiyaniMsAvPtpe3YLePWvpddUHDv6Qz8A&s",
    type: "Video"
  },
  {
    id: 2,
    title: "The Formation and Structure of Volcanoes",
    description: "Discover how volcanoes form and the different types of volcanic structures found around the world, from shield volcanoes to stratovolcanoes.",
    image: "https://www.thoughtco.com/thmb/RVHYNhzVuhQIGPETDM42VukXVsg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/an-active-volcano-spews-out-hot-red-lava-and-smoke--140189201-5b8e85b046e0fb00500d0e23.jpg",
    type: "Interactive Lesson"
  },
];

// Individual search result component
const SearchResult = ({ title, description, image, type }: { title: string; description: string; image: string; type: string }) => {
  return (
    <div className="flex border rounded-lg overflow-hidden mb-4 bg-white">
      <div className="w-1/4 min-w-[120px] max-w-[180px] relative">
        <img 
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex-1">
        <div className="text-xs text-blue-600 font-medium mb-1">{type}</div>
        <h3 className="font-medium text-base mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

// Search results container component
const SearchResults = ({ results }: { results: SearchResultType[] }) => {
  return (
    <div className="w-[600px] max-w-full px-4 mb-10">
      <h2 className="text-xl font-medium mb-4">Results</h2>
      <div>
        {results.map((result) => (
          <SearchResult
            key={result.id}
            title={result.title}
            description={result.description}
            image={result.image}
            type={result.type}
          />
        ))}
      </div>
    </div>
  );
};


export default async function Home() {

  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  
  return (
    <div className="flex flex-col items-center w-[600px] max-w-full mx-auto">
      <Suspense fallback={<div>Loading search...</div>}>
        <SearchInterface />
      </Suspense>
      
      {/* Search agent actions area */}
      <div className="w-[600px] max-w-full px-4 mb-10">
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
      
      {/* Search results section */}
      <SearchResults results={searchResults} />
    </div>
  );
}