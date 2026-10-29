import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../features/auth/useAuth";
import { api } from "../lib/api";
import { PERMISSIONS, getRoleBadgeVariant } from "../lib/permissions";
import {
  Settings,
  Users,
  Key,
  HeartHandshake,
  Store,
  Lock,
  Unlock,
  CheckCircle2,
  RefreshCw,
  X
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

export default function SettingsPage({ showToast = () => {} }) {
  const { organization, isAuthenticated, user, guestOrgType, setGuestOrgType, can } = useAuth();
  const currentOrgType = isAuthenticated ? organization?.type || "ngo" : guestOrgType || "ngo";

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("manager");
  const [updating, setUpdating] = useState(false);

  const isAdmin = can(PERMISSIONS.MANAGE_TEAM);

  useEffect(() => {
    let isMounted = true;

    api.users.listTeam(currentOrgType)
      .then((data) => {
        if (isMounted) setTeamMembers(data || []);
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load team members:", err);
          showToast("Unable to load organization team directory.", "error");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentOrgType, isAuthenticated, showToast]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const data = await api.users.listTeam(currentOrgType);
      setTeamMembers(data || []);
    } catch (err) {
      console.error("Failed to load team members:", err);
      showToast("Unable to load organization team directory.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      setUpdating(true);
      await api.users.updateRoleOrStatus(editUser.id, {
        role: selectedRole,
      });
      showToast(`Updated ${editUser.full_name}'s role to ${selectedRole.toUpperCase()}`, "success");
      setEditUser(null);
      await loadTeam();
    } catch (err) {
      showToast(err.message || "Failed to update member role.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (targetUser) => {
    if (!isAdmin) return;
    try {
      const nextStatus = !targetUser.is_active;
      await api.users.updateRoleOrStatus(targetUser.id, {
        is_active: nextStatus,
      });
      showToast(
        `${targetUser.full_name} is now ${nextStatus ? "active" : "deactivated"}`,
        "info"
      );
      await loadTeam();
    } catch (err) {
      showToast(err.message || "Failed to update member status.", "error");
    }
  };

  const isNGO = currentOrgType === "ngo";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              <Settings className="w-6 h-6 text-[var(--accent)]" />
              <span>Organization & Workspace Settings</span>
            </h1>
            <Badge variant={isNGO ? "success" : "info"} size="sm">
              {isNGO ? "NGO Relief Operations" : "Retail Commercial"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Workspace configuration, tenancy profiles, API credentials, and team role matrix
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadTeam}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin text-[var(--accent)]" : ""}`} />
            <span>Sync Team</span>
          </Button>

          {!isAuthenticated && (
            <Link to="/login">
              <Button variant="primary" size="sm">
                <Lock className="w-3.5 h-3.5 mr-1" />
                <span>Sign in as Admin</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Guest Mode Notice vs Admin Clearance */}
      {!isAuthenticated ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/50 dark:from-[var(--bg-surface-elev)] dark:to-[var(--bg-surface-elev)]/60 border border-[var(--badge-border)]/80 border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[var(--text-primary)]">
                Public Read-Only Workspace Directory
              </p>
              <p className="text-[var(--text-muted)] mt-0.5 leading-tight">
                Team structure and workspace identity are visible. Sign in as <strong>Admin</strong> to modify member permissions, invite accounts, or access production API keys.
              </p>
            </div>
          </div>
          <Link to="/login" className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface-elev)] border border-[var(--badge-border)] border-[var(--border-subtle)] text-[var(--accent)] font-bold hover:shadow-xs transition-all cursor-pointer">
              <Unlock className="w-3.5 h-3.5" />
              <span>Sign In as Admin</span>
            </span>
          </Link>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-[var(--badge-bg)] dark:bg-[var(--badge-bg)] border border-[var(--badge-border)] dark:border-[var(--badge-border)] flex items-center justify-between text-xs text-[var(--accent)] dark:text-[var(--badge-text)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
            <span>
              <strong>Administrative Access:</strong> You are logged in as <strong>{user?.full_name} ({user?.role})</strong>. Role mutations and active flags are unlocked.
            </span>
          </div>
          <Badge variant="primary" size="sm">Workspace Admin</Badge>
        </div>
      )}

      {/* Grid: Organization Profile & Tenancy Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Workspace Identity */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 sm:p-6 border border-[var(--border-subtle)] space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border-subtle)]">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm">
                R1
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                  {organization?.name || (isNGO ? "Community Relief Organization" : "Sunrise Retail Store")}
                </h3>
                <p className="text-[11px] text-[var(--text-dim)]">
                  {isNGO ? "Humanitarian & Disaster Response" : "Commercial Small Business & Retail"}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-dim)]">Currency Standard:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {organization?.currency || "INR"} (â‚¹)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-dim)]">Relational Tenancy:</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {isNGO ? "Community NGO Mode" : "Retail Commercial Mode"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-dim)]">Database Engine:</span>
                <span className="font-mono font-semibold text-[var(--text-primary)]">
                  SQLAlchemy 2.0 / Relational DB
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-dim)]">Audit Immutability:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Strict Append-Only
                </span>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-2">
                  Preview Tenancy Mode:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGuestOrgType("ngo")}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      guestOrgType === "ngo"
                        ? "bg-[var(--badge-bg)] border-[var(--badge-border)] text-[var(--accent)] dark:bg-[var(--badge-bg)] dark:border-[var(--badge-border)] dark:text-[var(--badge-text)] shadow-2xs"
                        : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] dark:bg-[var(--bg-surface-elev)] border-[var(--border-subtle)]"
                    }`}
                  >
                    <HeartHandshake className="w-4 h-4 text-emerald-600" />
                    <span>NGO Relief</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGuestOrgType("retail")}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      guestOrgType === "retail"
                        ? "bg-[var(--badge-bg)] border-[var(--badge-border)] text-[var(--accent)] dark:bg-[var(--badge-bg)] dark:border-[var(--badge-border)] dark:text-[var(--badge-text)] shadow-2xs"
                        : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] dark:bg-[var(--bg-surface-elev)] border-[var(--border-subtle)]"
                    }`}
                  >
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>Retail Store</span>
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Security & API Credentials Card */}
          <Card className="p-5 sm:p-6 border border-[var(--border-subtle)] space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                  Developer API & Webhooks
                </h3>
              </div>
              {isAdmin ? (
                <Badge variant="success" size="sm">Active</Badge>
              ) : (
                <Badge variant="neutral" size="sm">Locked</Badge>
              )}
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Programmatic REST access keys for inventory synchronization and webhooks.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-[var(--text-dim)]">API Endpoint:</span>
                <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]/80 border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-secondary)] truncate">
                  http://127.0.0.1:8000/api/v1
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[var(--text-dim)]">Webhook Secret Key:</span>
                <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]/80 border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-secondary)] flex items-center justify-between">
                  {isAdmin ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      whsec_live_92837482910398471
                    </span>
                  ) : (
                    <span className="text-[var(--text-dim)]">whsec_************************</span>
                  )}
                  {!isAdmin && <Lock className="w-3.5 h-3.5 text-[var(--text-dim)]" />}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (7 cols): Team Member Directory & RBAC Roles */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="overflow-hidden border border-[var(--border-subtle)] shadow-sm space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  Team Members & RBAC Directory ({teamMembers.length})
                </h3>
              </div>
              <span className="text-[11px] text-[var(--text-dim)]">4-Tier Role Enforced</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-dim)] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Member</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {teamMembers.map((m) => {
                    const badge = getRoleBadgeVariant(m.role);
                    return (
                      <tr key={m.id} className="hover:bg-[var(--row-hover)] transition-colors">
                        <td className="py-3">
                          <div className="font-bold text-[var(--text-primary)]">
                            {m.full_name}
                          </div>
                          <div className="text-[11px] font-mono text-[var(--text-dim)]">
                            {m.email}
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge variant={badge.variant} size="sm">
                            {badge.label}
                          </Badge>
                        </td>
                        <td className="py-3 text-center">
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(m)}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-opacity hover:opacity-80 ${
                                m.is_active
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : "bg-[var(--bg-surface)] text-[var(--text-muted)] dark:bg-[var(--bg-surface-elev)] dark:text-[var(--text-dim)]"
                              }`}
                              title="Click to toggle member status"
                            >
                              {m.is_active ? "Active" : "Inactive"}
                            </button>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                m.is_active
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : "bg-[var(--bg-surface)] text-[var(--text-muted)] dark:bg-[var(--bg-surface-elev)] dark:text-[var(--text-dim)]"
                              }`}
                            >
                              {m.is_active ? "Active" : "Inactive"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => {
                                setEditUser(m);
                                setSelectedRole(m.role.toLowerCase());
                              }}
                              className="text-xs font-bold text-[var(--accent)] hover:underline cursor-pointer"
                            >
                              Edit Role
                            </button>
                          ) : (
                            <span className="text-[11px] text-[var(--text-dim)] flex items-center justify-end gap-1">
                              <Lock className="w-3 h-3" />
                              <span>Admin only</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {editUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditUser(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-sm bg-[var(--bg-surface-elev)] rounded-3xl p-6 shadow-2xl border border-[var(--border-subtle)] z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                  Update Member Role
                </h3>
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="p-1 rounded-lg text-[var(--text-dim)] hover:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  {editUser.full_name}
                </p>
                <p className="text-[11px] text-[var(--text-dim)] font-mono">
                  {editUser.email}
                </p>
              </div>

              <form onSubmit={handleUpdateRole} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Select Access Role:
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                  >
                    <option value="admin">Admin (Full administrative & security control)</option>
                    <option value="manager">Inventory Manager (Stock adjustments & procurement)</option>
                    <option value="accountant">Accountant (Donations, vouchers & tax ledgers)</option>
                    <option value="volunteer">Volunteer (Field distributions & intake)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditUser(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={updating}
                  >
                    {updating ? "Saving..." : "Save Role"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



