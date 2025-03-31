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
      if (!roleId) {
        setLoading(false);
        return;
      }
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

  
  const resetPermissions = () => {
    setRolePermissions(null);  
  };

  return (
    <RolePermissionsContext.Provider value={{ rolePermissions, loading, resetPermissions }}>
      {children}
    </RolePermissionsContext.Provider>
  );
};

// ✅ अब useSidebarPermissions में resetPermissions भी मिल जाएगा
export const useSidebarPermissions = () => useContext(RolePermissionsContext);
