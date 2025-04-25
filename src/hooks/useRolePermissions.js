import { useState, useEffect } from "react";
import { getRoleById } from "../lib/api"; // API call import kiya
import { data } from "react-router-dom";

const useRolePermissions = (id) => {
  const [rolePermissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
// ojihhjih
  useEffect(() => {
    if (!id) return;

    const fetchPermissions = async () => {
      try {
        const roleData = await getRoleById(id);
        
        const parsedPermissions =
        roleData?.data?.permissions && typeof roleData?.data?.permissions === "string"
          ? JSON.parse(roleData?.data?.permissions)
          : roleData?.data?.permissions;
      
      setPermissions(parsedPermissions);
      
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [id]);

  useEffect(() => {
  }, [rolePermissions]);

  return { rolePermissions, loading, error };
};

export default useRolePermissions;
