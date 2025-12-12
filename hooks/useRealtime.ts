import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';

interface RealtimeOptions<T> {
  event: string;
  onUpdate?: (data: T) => void;
}

export function useRealtime<T>({ event, onUpdate }: RealtimeOptions<T>) {
  const socket = useSocket();
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleUpdate = (newData: T) => {
      setData(newData);
      onUpdate?.(newData);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(event, handleUpdate);

    // Set initial connection state
    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(event, handleUpdate);
    };
  }, [socket, event, onUpdate]);

  return { data, isConnected, socket };
}

// Specific hooks for common events

export function useMatchUpdates(matchId: string) {
  const socket = useSocket();
  const [score, setScore] = useState<any>(null);

  useEffect(() => {
    if (!socket || !matchId) return;

    socket.emit('match:subscribe', matchId);

    const handleScoreUpdate = (data: any) => {
      if (data.matchId === matchId) {
        setScore(data);
      }
    };

    socket.on('match:score-update', handleScoreUpdate);

    return () => {
      socket.off('match:score-update', handleScoreUpdate);
      socket.emit('match:unsubscribe', matchId);
    };
  }, [socket, matchId]);

  return score;
}

export function useLiveFeed() {
  const { data } = useRealtime<any>({
    event: 'live-feed:update',
  });

  return data;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const { data } = useRealtime<any>({
    event: 'notification:new',
    onUpdate: (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    },
  });

  return notifications;
}

export function useFoodQueue() {
  const { data } = useRealtime<any>({
    event: 'food:queue-update',
  });

  return data;
}

export function useActiveUsers() {
  const [count, setCount] = useState(0);

  const { data } = useRealtime<{ count: number }>({
    event: 'stats:active-users',
    onUpdate: (data) => {
      setCount(Number(data.count));
    },
  });

  return count;
}
