"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
  createContext,
} from "react";
import { Path } from "./constant";

type Pathname = string;
type SearchParams = URLSearchParams;

interface RouterState {
  pathname: Pathname;
  searchParams: URLSearchParams;
}

interface RouterContextValue extends RouterState {
  navigate: (path: Pathname, options?: { state?: unknown }) => void;
  back: () => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function createRouterContextValue(
  pathname: Pathname,
  searchParams: URLSearchParams,
): RouterContextValue {
  return {
    pathname,
    searchParams,
    navigate: (path: Pathname) => {
      const fullPath = `#${path}`;
      if (window.location.hash !== fullPath) {
        window.location.hash = fullPath;
      }
    },
    back: () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.hash = `#${Path.Home}`;
      }
    },
  };
}

function getPathFromHash(): Pathname {
  if (typeof window === "undefined") {
    return Path.Home;
  }
  const hash = window.location.hash;
  if (hash.startsWith("#")) {
    return hash.slice(1) || Path.Home;
  }
  return Path.Home;
}

function getSearchParamsFromHash(pathname: Pathname): URLSearchParams {
  const queryIndex = pathname.indexOf("?");
  if (queryIndex === -1) {
    return new URLSearchParams();
  }
  const search = pathname.slice(queryIndex);
  return new URLSearchParams(search);
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RouterState>(() => {
    const pathname = getPathFromHash();
    const searchParams = getSearchParamsFromHash(pathname);
    return { pathname, searchParams };
  });

  useEffect(() => {
    const handleHashChange = () => {
      const pathname = getPathFromHash();
      const searchParams = getSearchParamsFromHash(pathname);
      setState({ pathname, searchParams });
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const contextValue = useMemo(
    () => createRouterContextValue(state.pathname, state.searchParams),
    [state.pathname, state.searchParams],
  );

  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  );
}

function useRouterContext(): RouterContextValue {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
}

export function usePathname(): Pathname {
  const { pathname } = useRouterContext();
  return pathname;
}

export function useSearchParams(): [
  SearchParams,
  (params: SearchParams) => void,
] {
  const { pathname, navigate } = useRouterContext();
  const searchParams = useRouterContext().searchParams;

  const setSearchParams = useCallback(
    (newParams: SearchParams) => {
      const queryString = newParams.toString();
      const newPath = queryString
        ? `${pathname.split("?")[0]}?${queryString}`
        : pathname.split("?")[0];
      navigate(newPath);
    },
    [pathname, navigate],
  );

  return [searchParams, setSearchParams];
}

export function useNavigate(): (
  path: Pathname | -1,
  options?: { state?: unknown },
) => void {
  const { navigate, back } = useRouterContext();
  return useCallback(
    (path: Pathname | -1) => {
      if (path === -1) {
        back();
      } else {
        navigate(path);
      }
    },
    [navigate, back],
  );
}

export function Link({
  href,
  children,
  className,
  onClick,
}: {
  href: Pathname;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick?.();
    window.location.hash = `#${href}`;
  };

  return (
    <a href={`#${href}`} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
