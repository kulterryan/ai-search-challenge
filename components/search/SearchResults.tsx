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
export const SearchResults = ({ results }: { results: SearchResultType[] }) => {
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