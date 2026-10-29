import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./authContext";
import { api } from "../../lib/api";
import { can as canCheck, ROLES, normalizeRole } from "../../lib/permissions";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guestOrgType, setGuestOrgType] = useState("ngo");

  useEffect(() => {
    let isMounted = true;

    api.auth.getMe()
      .then((sessionUser) => {
        if (isMounted) setUser(sessionUser);
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    if (res && res.user) {
      try {
        const fullUser = await api.auth.getMe();
        setUser(fullUser);
        return fullUser;
      } catch {
        setUser(res.user);
        return res.user;
      }
    }
    return res;
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  const role = user ? normalizeRole(user.role) : ROLES.GUEST;
  const isAuthenticated = Boolean(user);

  const organization = user
    ? {
        id: user.org_id,
        name: user.org_name || (user.role === "retail" ? "Sunrise Retail Store" : "Community Relief Organization"),
        type: user.org_type || "ngo",
        currency: user.currency || "INR",
      }
    : {
        id: 1,
        name: guestOrgType === "retail" ? "Sunrise Retail Store" : "Community Relief Organization",
        type: guestOrgType,
        currency: "INR",
      };

  const checkPermission = useCallback(
    (permission) => {
      return canCheck(role, permission);
    },
    [role]
  );

  const value = {
    user,
    role,
    isAuthenticated,
    isLoading,
    organization,
    guestOrgType,
    setGuestOrgType,
    login,
    logout,
    can: checkPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
