import axios from 'axios';
import { getToken, setToken } from '../auth/tokenStore';
import { GUEST_MODE } from '../guestMode';
import { applyGuestWager, getGuestBalance } from './guestWallet';

// .NET API (API/) runs on 5054; the old C++ server.exe was on 8080.
const API_URL = 'http://localhost:5054/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Every authenticated endpoint needs the same header, so it is attached once
// here instead of being rebuilt at each call site.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  message: string;
}

interface UpdateUserResponse {
  message: string;
}

interface WalletBalanceResponse {
  balance: number;
}

interface UserInfoResponse {
  username: string;
  email: string;
  balance: number;
}

// Interface for error handling
interface AuthError {
  type: string;
  message: string;
}

// Every failure from the API comes back as { error: "..." } -- see the
// InvalidModelStateResponseFactory in API/Extensions/ApplicationServiceExtensions.cs.
interface ApiErrorBody {
  error?: string;
}

// Single place that turns a thrown axios error into the { type, message } shape
// the callers expect. `action` is the verb used in the message, e.g. "Login".
const toAuthError = (error: unknown, action: string): AuthError => {
  if (axios.isAxiosError<ApiErrorBody | string>(error)) {
    if (error.response) {
      const body = error.response.data;
      const detail = typeof body === 'string' ? body : body.error;
      return {
        type: 'http_error',
        message: `${action} failed: ${detail ?? error.response.statusText}`,
      };
    }
    if (error.request) {
      return {
        type: 'network_error',
        message: `${action} failed: No response received from the server`,
      };
    }
  }
  return {
    type: 'unknown_error',
    message: error instanceof Error ? error.message : `${action} failed: An unknown error occurred`,
  };
};

// The authenticated endpoints fail fast rather than sending a request that is
// certain to 401. The interceptor still attaches the header for the real call.
const missingToken = (): AuthError | null =>
  getToken()
    ? null
    : { type: 'auth_error', message: 'No authentication token found. Please log in again.' };

export const login = async (username: string, password: string): Promise<LoginResponse | AuthError> => {
  try {
    // The API returns the JWT as a bare string, not wrapped in an object.
    const { data } = await api.post<string>('/user/login', { username, password });

    if (!data) {
      return { type: 'unknown_error', message: 'Login failed: Invalid response' };
    }

    // setToken, not localStorage.setItem -- this is what notifies useIsAuthenticated.
    setToken(data);
    return { token: data };
  } catch (error) {
    return toAuthError(error, 'Login');
  }
};

export const register = async (
  username: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<RegisterResponse | AuthError> => {
  try {
    const response = await api.post<RegisterResponse>('/user/register', {
      username,
      email,
      password,
      confirmPassword,
    });

    // The API returns 201 on success; anything else is not a completed registration.
    if (response.status !== 201) {
      return { type: 'unknown_error', message: 'Registration failed: Invalid response' };
    }

    return { message: 'User registered successfully' };
  } catch (error) {
    return toAuthError(error, 'Registration');
  }
};

export const fetchWalletBalance = async (): Promise<WalletBalanceResponse | AuthError> => {
  if (GUEST_MODE) return { balance: getGuestBalance() };

  const noToken = missingToken();
  if (noToken) return noToken;

  try {
    // The balance endpoint returns a raw number, not an object.
    const { data } = await api.get<number>('/wallet/balance');
    return { balance: Number(data) };
  } catch (error) {
    return toAuthError(error, 'Wallet balance fetch');
  }
};

export const updateWalletBalance = async (
  wager: string,
  outcome: 'win' | 'loss'
): Promise<WalletBalanceResponse | AuthError> => {
  if (GUEST_MODE) {
    const result = applyGuestWager(wager, outcome);
    return typeof result === 'number'
      ? { balance: result }
      : { type: 'http_error', message: `Wallet balance update failed: ${result}` };
  }

  const noToken = missingToken();
  if (noToken) return noToken;

  try {
    const { data } = await api.post<WalletBalanceResponse>('/wallet/wager', { wager, outcome });
    return { balance: Number(data.balance) };
  } catch (error) {
    return toAuthError(error, 'Wallet balance update');
  }
};

export const fetchUserInfo = async (): Promise<UserInfoResponse | AuthError> => {
  const noToken = missingToken();
  if (noToken) return noToken;

  try {
    const { data } = await api.get<UserInfoResponse>('/user/user_info');
    return {
      username: data.username,
      email: data.email,
      balance: Number(data.balance),
    };
  } catch (error) {
    return toAuthError(error, 'User info fetch');
  }
};

export const updateUserInfo = async (
  username?: string,
  email?: string
): Promise<UpdateUserResponse | AuthError> => {
  const noToken = missingToken();
  if (noToken) return noToken;

  // Only send the fields that were actually filled in; both are optional server-side.
  const payload: Record<string, string> = {};
  if (username?.trim()) payload.username = username.trim();
  if (email?.trim()) payload.email = email.trim();

  try {
    const { data } = await api.post<UpdateUserResponse | string>('/user/update_user', payload);

    if (typeof data === 'string') {
      return { message: data || 'User updated successfully' };
    }
    return { message: data.message || 'User updated successfully' };
  } catch (error) {
    return toAuthError(error, 'User update');
  }
};
