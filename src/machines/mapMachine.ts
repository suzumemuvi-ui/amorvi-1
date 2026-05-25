// @ts-ignore
import { setup, assign } from 'xstate';

interface RadarData {
  id: string;
  userId: string;
  distance: number;
  latitude: number;
  longitude: number;
  lastUpdated: number;
}

interface MapContext {
  radarEnabled: boolean;
  radarRadius: number; // in meters
  nearbyUsers: RadarData[];
  userLocation: { latitude: number; longitude: number } | null;
  loading: boolean;
  error: string | null;
}

type MapEvent =
  | { type: 'ENABLE_RADAR' }
  | { type: 'DISABLE_RADAR' }
  | { type: 'SET_RADIUS'; payload: number }
  | { type: 'UPDATE_LOCATION'; payload: { latitude: number; longitude: number } }
  | { type: 'LOAD_NEARBY_USERS' }
  | { type: 'LOAD_SUCCESS'; payload: RadarData[] }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'REFRESH' };

/**
 * Map & Radar State Machine
 * Manages geolocation and radar functionality
 */
export const mapMachine = setup({
  types: {
    context: {} as MapContext,
    events: {} as MapEvent,
  },
  actions: {
    enableRadar: assign({
      radarEnabled: true,
    }),
    disableRadar: assign({
      radarEnabled: false,
    }),
    setRadius: assign({
      radarRadius: ({ event }: { event: any }) =>
        event.type === 'SET_RADIUS' ? event.payload : 500,
    }),
    updateLocation: assign({
      userLocation: ({ event }: { event: any }) =>
        event.type === 'UPDATE_LOCATION' ? event.payload : null,
    }),
    setNearbyUsers: assign({
      nearbyUsers: ({ event }: { event: any }) =>
        event.type === 'LOAD_SUCCESS' ? event.payload : [],
    }),
    setError: assign({
      error: ({ event }: { event: any }) =>
        event.type === 'LOAD_ERROR' ? event.payload : null,
    }),
    setLoading: assign({
      loading: true,
    }),
    clearLoading: assign({
      loading: false,
    }),
  },
  guards: {
    isRadarEnabled: ({ context }: { context: MapContext }) =>
      context.radarEnabled,
  },
}).createMachine({
  id: 'map',
  initial: 'idle',
  context: {
    radarEnabled: false,
    radarRadius: 500,
    nearbyUsers: [],
    userLocation: null,
    loading: false,
    error: null,
  },
  states: {
    idle: {
      on: {
        ENABLE_RADAR: 'active',
        UPDATE_LOCATION: {
          actions: 'updateLocation',
        },
      },
    },
    active: {
      entry: ['enableRadar', 'setLoading'],
      on: {
        DISABLE_RADAR: 'idle',
        SET_RADIUS: {
          actions: 'setRadius',
        },
        UPDATE_LOCATION: {
          actions: ['updateLocation'],
          target: 'loading',
        },
        LOAD_NEARBY_USERS: 'loading',
        REFRESH: 'loading',
      },
    },
    loading: {
      invoke: {
        src: 'fetchNearbyUsers',
        onDone: {
          target: 'active',
          actions: ['setNearbyUsers', 'clearLoading'],
        },
        onError: {
          target: 'error',
          actions: ['setError', 'clearLoading'],
        },
      },
    },
    error: {
      after: {
        5000: 'active', // Retry after 5 seconds
      },
      on: {
        REFRESH: 'loading',
        DISABLE_RADAR: 'idle',
      },
    },
  },
});
