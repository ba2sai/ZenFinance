import { create } from 'zustand';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthState {
  user: User | null;
  orgId: string | null;
  googleAccessToken: string | null;
  loading: boolean;
  isOnboardingComplete: boolean;
  setUser: (user: User | null, orgId: string | null, isOnboardingComplete: boolean, googleAccessToken?: string | null) => void;
  setGoogleAccessToken: (token: string | null) => void;
  setOnboardingComplete: (status: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  orgId: null,
  googleAccessToken: null,
  loading: true,
  isOnboardingComplete: false,
  setUser: (user, orgId, isOnboardingComplete, googleAccessToken = null) => set((state) => ({ 
    user, 
    orgId, 
    loading: false, 
    isOnboardingComplete,
    googleAccessToken: googleAccessToken || state.googleAccessToken 
  })),
  setGoogleAccessToken: (googleAccessToken) => set({ googleAccessToken }),
  setOnboardingComplete: (status) => {
    const { user } = useAuthStore.getState();
    if (user) {
      localStorage.setItem(`zen_onboarding_${user.uid}`, status.toString());
    }
    set({ isOnboardingComplete: status });
  },
  logout: async () => {
    await auth.signOut();
    set({ user: null, orgId: null, isOnboardingComplete: false, googleAccessToken: null });
  },
}));

// Listener for auth state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const token = await user.getIdTokenResult();
    // CRITICAL FIX: Default to user.uid if no specific orgId claim exists
    // This ensures every user gets their own private workspace by default
    const orgId = (token.claims.orgId as string) || user.uid;
    
    // Check localStorage for onboarding status (robust demo mode)
    const localOnboarding = localStorage.getItem(`zen_onboarding_${user.uid}`) === 'true';
    
    useAuthStore.getState().setUser(user, orgId, localOnboarding);
  } else {
    useAuthStore.getState().setUser(null, null, false);
  }
});
