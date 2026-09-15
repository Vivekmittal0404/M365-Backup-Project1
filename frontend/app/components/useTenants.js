"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

// NOTE: assumes a GET /api/tenant/list endpoint (userId scoped, from the JWT)
// returning [{ tenantId, displayName, status }]. The build sheet only specifies
// connect-url/callback — a list endpoint is needed by every page below that
// scopes data to a tenant, so add it alongside those two routes.
export default function useTenants() {
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tenant/list");
      const list = Array.isArray(data) ? data : data?.tenants || [];
      setTenants(list);
      const saved = localStorage.getItem("activeTenantId");
      const stillValid = list.find((t) => t.tenantId === saved);
      const next = stillValid ? saved : list[0]?.tenantId || "";
      setTenantId(next);
      if (next) localStorage.setItem("activeTenantId", next);
    } catch {
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function selectTenant(id) {
    setTenantId(id);
    localStorage.setItem("activeTenantId", id);
  }

  return { tenants, tenantId, selectTenant, loading, refresh };
}
