// src/context/RolePermissionsContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { getRoleById } from "../lib/api";

const RolePermissionsContext = createContext();

export const RolePermissionsProvider = ({ children }) => {
  const [rolePermissions, setRolePermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  const roleId = JSON.parse(localStorage.getItem("user"))?.user?.roleId;

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!roleId) return;
      try {
        const res = await getRoleById(roleId);
        const parsed = typeof res?.data?.permissions === "string"
          ? JSON.parse(res.data.permissions)
          : res.data.permissions;
        setRolePermissions(parsed);
      } catch (err) {
        console.error("Error loading role permissions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, [roleId]);

  return (
    <RolePermissionsContext.Provider value={{ rolePermissions, loading }}>
      {children}
    </RolePermissionsContext.Provider>
  );
};

export const useSidebarPermissions = () => useContext(RolePermissionsContext);
