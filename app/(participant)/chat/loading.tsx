export default function LoadingChat() {
  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[400px]">
      <div className="flex-1 space-y-4 p-4">
        <div className="animate-pulse flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <div className="animate-pulse flex items-end gap-3 justify-end">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2 ml-auto" />
          </div>
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="p-4 border-t">
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
}
