import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Trash2,
  Edit,
  Shield,
  User as UserIcon,
  Check,
  AlertCircle,
  Building2,
  Lock,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add / Edit form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('staff');
  const [formDepartment, setFormDepartment] = useState('Main OT');

  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Fetch users list from server API
  const fetchUsersList = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsersList();
      setErrorMsg('');
      setSuccessMsg('');
      setIsFormOpen(false);
      setEditingUserId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setEditingUserId(null);
    setFormUsername('');
    setFormPassword('');
    setFormFullName('');
    setFormRole('staff');
    setFormDepartment('Main OT');
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUserId(user.id);
    setFormUsername(user.username);
    setFormPassword(''); // Password blank unless editing
    setFormFullName(user.fullName);
    setFormRole(user.role);
    setFormDepartment(user.department || 'General');
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formUsername.trim() || !formFullName.trim()) {
      setErrorMsg('Username and Full Name are required.');
      return;
    }

    if (!editingUserId && !formPassword) {
      setErrorMsg('Password is required for new user.');
      return;
    }

    try {
      if (editingUserId) {
        // Update user
        const res = await fetch(`/api/users/${editingUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formUsername.trim(),
            fullName: formFullName.trim(),
            role: formRole,
            department: formDepartment,
            ...(formPassword ? { password: formPassword } : {}),
          }),
        });

        if (res.ok) {
          setSuccessMsg(`User ${formFullName} updated successfully!`);
          setIsFormOpen(false);
          fetchUsersList();
        } else {
          const data = await res.json();
          setErrorMsg(data.error || 'Failed to update user.');
        }
      } else {
        // Create user
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formUsername.trim(),
            password: formPassword,
            fullName: formFullName.trim(),
            role: formRole,
            department: formDepartment,
          }),
        });

        if (res.ok) {
          setSuccessMsg(`New staff user ${formFullName} created successfully!`);
          setIsFormOpen(false);
          fetchUsersList();
        } else {
          const data = await res.json();
          setErrorMsg(data.error || 'Failed to create user.');
        }
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Server request failed.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      const res = await fetch(`/api/users/${deletingUser.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccessMsg(`User ${deletingUser.fullName} deleted.`);
        setDeletingUser(null);
        fetchUsersList();
      } else {
        setErrorMsg('Failed to delete user.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-[#0B0F17]/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#111722] rounded-3xl sm:rounded-[18px] border border-stone-200 dark:border-[#202A3A] shadow-2xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.30)] max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-100 dark:border-[#202A3A] bg-stone-50/50 dark:bg-[#151D2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-[#1A2A4A] text-blue-600 dark:text-[#4F7CFF] border border-transparent dark:border-[rgba(79,124,255,0.25)] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F1F5F9] font-display">
                Staff User Management Panel
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#718096]">
                Admin Panel &bull; Create, Edit & Delete Hospital Staff Accounts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-[#F1F5F9] hover:bg-stone-100 dark:hover:bg-[#202A3A] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Status Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-[rgba(241,91,108,0.12)] border border-rose-200 dark:border-[rgba(241,91,108,0.25)] text-rose-700 dark:text-[#F15B6C] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-[#F15B6C]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[rgba(34,201,151,0.12)] border border-emerald-200 dark:border-[rgba(34,201,151,0.25)] text-emerald-700 dark:text-[#22C997] text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-500 dark:text-[#22C997]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#718096] uppercase tracking-wider font-display">
              Registered Hospital Users ({users.length})
            </span>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-3.5 py-2 rounded-[9px] bg-[#4F7CFF] hover:bg-[#638DFF] text-white text-xs font-semibold shadow-[0_2px_8px_rgba(79,124,255,0.25)] transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff User</span>
            </button>
          </div>

          {/* Form Modal / Inline Form */}
          {isFormOpen && (
            <form
              onSubmit={handleSaveUser}
              className="p-4 rounded-2xl bg-blue-50/60 dark:bg-[#151D2A] border border-blue-200/80 dark:border-[#202A3A] space-y-3 animate-fade-in"
            >
              <h3 className="text-xs font-bold text-blue-900 dark:text-[#F1F5F9] uppercase tracking-wider font-display">
                {editingUserId ? 'Edit Staff User Account' : 'Create New Hospital Staff User'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-[#F1F5F9]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    placeholder="e.g. Dr. Sharma or Nurse Anjali"
                    required
                    className="w-full px-3 py-2 text-xs rounded-[9px] bg-white dark:bg-[#0D131E] border border-stone-200 dark:border-[#202A3A] dark:hover:border-[#344158] text-slate-900 dark:text-[#F1F5F9] dark:placeholder-[#718096] focus:outline-none dark:focus:border-[#4F7CFF] dark:focus:shadow-[0_0_0_3px_rgba(79,124,255,0.10)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-[#F1F5F9]">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="e.g. nurse1"
                    required
                    className="w-full px-3 py-2 text-xs rounded-[9px] bg-white dark:bg-[#0D131E] border border-stone-200 dark:border-[#202A3A] dark:hover:border-[#344158] text-slate-900 dark:text-[#F1F5F9] dark:placeholder-[#718096] focus:outline-none dark:focus:border-[#4F7CFF] dark:focus:shadow-[0_0_0_3px_rgba(79,124,255,0.10)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-[#F1F5F9]">
                    {editingUserId ? 'Password (Leave blank to keep unchanged)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="••••••••"
                    required={!editingUserId}
                    className="w-full px-3 py-2 text-xs rounded-[9px] bg-white dark:bg-[#0D131E] border border-stone-200 dark:border-[#202A3A] dark:hover:border-[#344158] text-slate-900 dark:text-[#F1F5F9] dark:placeholder-[#718096] focus:outline-none dark:focus:border-[#4F7CFF] dark:focus:shadow-[0_0_0_3px_rgba(79,124,255,0.10)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-[#F1F5F9]">
                    Role *
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs rounded-[9px] bg-white dark:bg-[#0D131E] border border-stone-200 dark:border-[#202A3A] dark:hover:border-[#344158] text-slate-900 dark:text-[#F1F5F9] focus:outline-none dark:focus:border-[#4F7CFF] font-medium"
                  >
                    <option value="staff">👤 Staff / User</option>
                    <option value="admin">👑 Main Admin</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-[#F1F5F9]">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="e.g. Main OT, Pharmacy, OPD, Administration"
                    className="w-full px-3 py-2 text-xs rounded-[9px] bg-white dark:bg-[#0D131E] border border-stone-200 dark:border-[#202A3A] dark:hover:border-[#344158] text-slate-900 dark:text-[#F1F5F9] dark:placeholder-[#718096] focus:outline-none dark:focus:border-[#4F7CFF] dark:focus:shadow-[0_0_0_3px_rgba(79,124,255,0.10)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 rounded-[9px] border border-stone-300 dark:border-[#202A3A] text-slate-700 dark:text-[#A7B2C4] text-xs font-medium hover:bg-stone-100 dark:hover:bg-[#202A3A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[9px] bg-[#4F7CFF] hover:bg-[#638DFF] text-white text-xs font-semibold shadow-sm"
                >
                  {editingUserId ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          )}

          {/* Users Table */}
          <div className="border border-stone-200/80 dark:border-[#202A3A] rounded-2xl overflow-hidden bg-white dark:bg-[#111722]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 dark:bg-[#151D2A] border-b border-stone-200/80 dark:border-[#202A3A] text-[11px] uppercase tracking-wider font-display text-slate-500 dark:text-[#718096]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-[#202A3A] text-xs">
                  {users.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    const isAdminRole = u.role === 'admin';

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-stone-50/60 dark:hover:bg-[#151D2A]/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-[#F1F5F9]">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-[#151D2A] border border-transparent dark:border-[#202A3A] text-slate-600 dark:text-[#A7B2C4] flex items-center justify-center font-bold text-xs">
                              {u.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-[#F1F5F9]">
                                {u.fullName} {isSelf && <span className="text-[10px] text-blue-600 dark:text-[#4F7CFF] font-normal">(You)</span>}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-[#A7B2C4]">
                          {u.username}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isAdminRole
                                ? 'bg-amber-50 dark:bg-[rgba(245,184,61,0.12)] text-amber-700 dark:text-[#F5B83D] border border-amber-200 dark:border-[rgba(245,184,61,0.25)]'
                                : 'bg-blue-50 dark:bg-[rgba(79,124,255,0.12)] text-blue-700 dark:text-[#638DFF] border border-blue-200 dark:border-[rgba(79,124,255,0.25)]'
                            }`}
                          >
                            {isAdminRole ? '👑 Main Admin' : '👤 Staff'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-500 dark:text-[#718096]">
                          {u.department || 'General'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(u)}
                              title="Edit User"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-[#4F7CFF] hover:bg-stone-100 dark:hover:bg-[#151D2A]"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => setDeletingUser(u)}
                                title="Delete User"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-[#F15B6C] hover:bg-stone-100 dark:hover:bg-[rgba(241,91,108,0.12)]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-[#202A3A] bg-stone-50/50 dark:bg-[#151D2A]/60 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 dark:text-[#718096] font-mono">
            Logins are synced across all hospital devices via MongoDB.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[9px] bg-stone-200 dark:bg-[#202A3A] text-slate-800 dark:text-[#F1F5F9] text-xs font-semibold hover:bg-stone-300 dark:hover:bg-[#344158] cursor-pointer transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>

      {/* Delete User Confirmation Overlay */}
      {deletingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Delete Staff User Account?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete user account <strong>{deletingUser.fullName}</strong> (@{deletingUser.username})? They will no longer be able to log in.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-stone-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
