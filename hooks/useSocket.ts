import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '@/lib/socket';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, []);

  return socket;
};
