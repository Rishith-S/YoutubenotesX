
const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <div className="relative inline-flex">
              {/* Outer ring with gradient */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 opacity-20 animate-pulse"></div>
              
              {/* Inner spinning loader */}
              <div className="absolute top-1 left-1 w-14 h-14 rounded-full border-2 border-gray-700"></div>
              <div className="absolute top-1 left-1 w-14 h-14 rounded-full border-2 border-r-transparent border-t-transparent border-orange-400 animate-spin"></div>
              
              {/* Center dot */}
              <div className="absolute top-6 left-6 w-4 h-4 rounded-full bg-orange-400 animate-pulse"></div>
            </div>
        
        <p className="mt-6 text-sm text-gray-400 tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );
};

export default LoadingScreen;