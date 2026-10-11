import React, { ReactNode, createContext, useContext } from 'react';
// @ts-ignore
import { useMachine } from '@xstate/react';
// @ts-ignore
import { authMachine } from '../machines/authMachine';
// @ts-ignore
import { userMachine } from '../machines/userMachine';
// @ts-ignore
import { mapMachine } from '../machines/mapMachine';
// @ts-ignore
import { chatMachine } from '../machines/chatMachine';

interface AmorviContextType {
  // Auth Machine
  authActor: (event: any) => void;
  authState: any;
  
  // User Machine
  userActor: (event: any) => void;
  userState: any;
  
  // Map Machine
  mapActor: (event: any) => void;
  mapState: any;
  
  // Chat Machine
  chatActor: (event: any) => void;
  chatState: any;
}

const AmorviContext = createContext<AmorviContextType | undefined>(undefined);

export function AmorviProvider({ children }: { children: ReactNode }) {
  const [authState, authActor] = useMachine(authMachine, {
    actions: {
      authenticate: async () => {
        // Simulate API call
        return new Promise(resolve => {
          setTimeout(() => resolve(null), 1500);
        });
      },
    },
  } as any);

  const [userState, userActor] = useMachine(userMachine, {
    actions: {
      fetchUsers: async () => {
        // Simulate API call
        return new Promise(resolve => {
          setTimeout(() => {
            resolve([]);
          }, 1000);
        });
      },
      verifyUser: async () => {
        return new Promise(resolve => {
          setTimeout(() => resolve(null), 2000);
        });
      },
    },
  } as any);

  const [mapState, mapActor] = useMachine(mapMachine, {
    actions: {
      fetchNearbyUsers: async () => {
        // Simulate API call
        return new Promise(resolve => {
          setTimeout(() => {
            resolve([]);
          }, 1000);
        });
      },
    },
  } as any);

  const [chatState, chatActor] = useMachine(chatMachine, {
    actions: {
      loadMessages: async () => {
        // Simulate API call
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ conversationId: '', messages: [] });
          }, 500);
        });
      },
      sendMessage: async () => {
        // Simulate API call
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              id: '',
              senderId: '',
              receiverId: '',
              content: '',
              timestamp: Date.now(),
              read: false,
            });
          }, 500);
        });
      },
    },
  } as any);

  const value: AmorviContextType = {
    authActor,
    authState,
    userActor,
    userState,
    mapActor,
    mapState,
    chatActor,
    chatState,
  };

  return (
    <AmorviContext.Provider value={value}>
      {children}
    </AmorviContext.Provider>
  );
}

export function useAmorvi() {
  const context = useContext(AmorviContext);
  if (!context) {
    throw new Error('useAmorvi must be used within AmorviProvider');
  }
  return context;
}

export function useAuth() {
  const { authState, authActor } = useAmorvi();
  return {
    state: authState,
    send: authActor,
    context: authState.context,
    matches: (state: string) => authState.matches(state),
  };
}

export function useUser() {
  const { userState, userActor } = useAmorvi();
  return {
    state: userState,
    send: userActor,
    context: userState.context,
    matches: (state: string) => userState.matches(state),
  };
}

export function useMap() {
  const { mapState, mapActor } = useAmorvi();
  return {
    state: mapState,
    send: mapActor,
    context: mapState.context,
    matches: (state: string) => mapState.matches(state),
  };
}

export function useChat() {
  const { chatState, chatActor } = useAmorvi();
  return {
    state: chatState,
    send: chatActor,
    context: chatState.context,
    matches: (state: string) => chatState.matches(state),
  };
}
