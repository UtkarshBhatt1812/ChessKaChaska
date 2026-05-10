"use client";

import axios from "axios";
import { PropsWithChildren, useEffect, useRef } from "react";
import { Provider } from "react-redux";
import ThemeToggleButton from "./components/ThemeToggleButton";
import { clearUser, setUser, type AuthUser } from "./store/authSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { store } from "./store/store";
import { selectThemeMode, setTheme, type ThemeMode } from "./store/themeSlice";

type AuthMeResponse = {
  user: AuthUser | null;
};

function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) {
      return;
    }

    bootstrappedRef.current = true;

    let cancelled = false;

    const bootstrapAuth = async () => {
      try {
        const { data } = await axios.get<AuthMeResponse>("/api/v1/auth/me", {
          withCredentials: true,
        });

        if (cancelled) {
          return;
        }

        if (data.user) {
          dispatch(setUser(data.user));
          return;
        }

        dispatch(clearUser());
      } catch {
        if (!cancelled) {
          dispatch(clearUser());
        }
      }
    };

    bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
}

function ThemeBootstrap() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(selectThemeMode);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("onyx-theme");

    if (storedTheme === "light" || storedTheme === "dark") {
      dispatch(setTheme(storedTheme as ThemeMode));
    }
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode;
    window.localStorage.setItem("onyx-theme", themeMode);
  }, [themeMode]);

  return null;
}

export default function Providers({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <AuthBootstrap />
      <ThemeBootstrap />
      {children}
      <ThemeToggleButton />
    </Provider>
  );
}
