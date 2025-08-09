import type { UserCursor } from '../../types/realtime';

interface CollaborativeCursorProps {
  cursor: UserCursor;
  className?: string;
}

export function CollaborativeCursor({ cursor, className = '' }: CollaborativeCursorProps) {
  const { x, y, userName, userAvatar } = cursor;

  // Don't render if cursor is outside viewport
  if (x < 0 || y < 0) {
    return null;
  }

  return (
    <div
      className={`fixed pointer-events-none z-50 transition-all duration-100 ${className}`}
      style={{
        left: x,
        top: y,
        transform: 'translate(-2px, -2px)'
      }}
    >
      {/* Cursor pointer */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="drop-shadow-md"
      >
        <path
          d="M2 2L18 8L8 12L2 18V2Z"
          fill="#3B82F6"
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      
      {/* User info tooltip */}
      <div className="absolute top-5 left-2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap flex items-center gap-1 shadow-lg">
        {userAvatar && (
          <img
            src={userAvatar}
            alt={userName}
            className="w-4 h-4 rounded-full"
          />
        )}
        <span>{userName}</span>
      </div>
    </div>
  );
}

interface CollaborativeCursorsProps {
  cursors: UserCursor[];
  className?: string;
}

export function CollaborativeCursors({ cursors, className = '' }: CollaborativeCursorsProps) {
  return (
    <div className={className}>
      {cursors.map((cursor) => (
        <CollaborativeCursor
          key={cursor.userId}
          cursor={cursor}
        />
      ))}
    </div>
  );
}