import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { updateCursor, removeCursor } from '../../store/slices/collaborationSlice';

interface CursorTrackerProps {
  enabled?: boolean;
}

interface CursorPosition {
  x: number;
  y: number;
  timestamp: number;
}

// RemoteCursor interface removed as it's not used

const CursorTracker: React.FC<CursorTrackerProps> = ({ enabled = true }) => {
  const dispatch = useDispatch();
  const cursors = useSelector((state: RootState) => state.collaboration.cursors);
  const settings = useSelector((state: RootState) => state.collaboration.settings);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !settings.enableCursorTracking || !currentUser) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < settings.cursorUpdateInterval) {
        return;
      }

      lastUpdateRef.current = now;
      
      const position: CursorPosition = {
        x: event.clientX,
        y: event.clientY,
        timestamp: now,
      };

      // Update local cursor position
      dispatch(updateCursor({
        userId: currentUser.id,
        position,
      }));

      // In a real implementation, this would send the cursor position to other users
      // via WebSocket or similar real-time communication
    };

    const handleMouseLeave = () => {
      if (currentUser) {
        dispatch(removeCursor(currentUser.id));
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, settings.enableCursorTracking, settings.cursorUpdateInterval, currentUser, dispatch]);

  if (!enabled || !settings.enableCursorTracking) {
    return null;
  }

  // Render remote cursors
  const remoteCursors = Object.entries(cursors)
    .filter(([userId]) => userId !== currentUser?.id)
    .map(([userId, position]) => ({
      userId,
      userName: `User ${userId.slice(0, 8)}`,
      position,
      color: `hsl(${userId.charCodeAt(0) * 137.508}deg, 70%, 50%)`,
    }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {remoteCursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-100 ease-out"
          style={{
            left: cursor.position.x,
            top: cursor.position.y,
            transform: 'translate(-2px, -2px)',
          }}
        >
          {/* Cursor pointer */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            className="drop-shadow-sm"
          >
            <path
              d="M2 2L18 8L8 12L2 18L2 2Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          
          {/* User name label */}
          <div
            className="absolute top-5 left-2 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.userName}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CursorTracker;