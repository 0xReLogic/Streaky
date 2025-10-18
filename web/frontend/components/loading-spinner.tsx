export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="relative">
        {/* Spinning ring */}
        <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        
        {/* Fire emoji in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl animate-pulse">🔥</span>
        </div>
      </div>
    </div>
  );
}
