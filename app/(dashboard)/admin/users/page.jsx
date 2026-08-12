"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/data-table/confirm-dialog";
import { getUserColumns } from "@/components/columns/user-columns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function UsersPage() {
  const [users, setUsers] = useState([]), [roles, setRoles] = useState([]), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null), [editOpen, setEditOpen] = useState(false), [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", roleId: "", password: "", isActive: true });
  const load = async () => { try { const { data } = await axios.get("/api/admin/users"); if (data.success) { setUsers(data.data); setRoles(data.roles); } } catch { toast.error("Failed to load users"); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const edit = (user) => { setSelected(user); setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, roleId: user.roleId, password: "", isActive: user.isActive }); setEditOpen(true); };
  const save = async (event) => { event.preventDefault(); setSaving(true); try { await axios.put(`/api/admin/users/${selected.id}`, form); toast.success("User updated"); setEditOpen(false); load(); } catch (error) { toast.error(error.response?.data?.message || "Failed to update user"); } finally { setSaving(false); } };
  const remove = async () => { setSaving(true); try { await axios.delete(`/api/admin/users/${selected.id}`); toast.success("User deactivated"); setConfirmOpen(false); load(); } catch { toast.error("Failed to deactivate user"); } finally { setSaving(false); } };
  const columns = getUserColumns({ onEdit: edit, onDelete: (user) => { setSelected(user); setConfirmOpen(true); } });
  const active = users.filter((u) => u.isActive).length;
  return <div className="p-6 space-y-6"><div><h1 className="text-2xl font-semibold">Users</h1><p className="text-sm text-muted-foreground mt-1">Manage customer accounts and access</p></div><div className="grid grid-cols-3 gap-4"><div className="bg-secondary rounded-lg p-4"><p className="text-sm text-muted-foreground">Total users</p><p className="text-2xl font-semibold">{users.length}</p></div><div className="bg-secondary rounded-lg p-4"><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-semibold text-green-600">{active}</p></div><div className="bg-secondary rounded-lg p-4"><p className="text-sm text-muted-foreground">Inactive</p><p className="text-2xl font-semibold text-gray-400">{users.length - active}</p></div></div><Separator /><DataTable columns={columns} data={users} searchKey="firstName" searchPlaceholder="Search users..." isLoading={loading} /><Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Edit user</DialogTitle></DialogHeader><form onSubmit={save} className="space-y-4"><div className="grid grid-cols-2 gap-3"><div><Label>First name</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div><div><Label>Last name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div></div><div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div><div><Label>Role</Label><select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></div><div><Label>New password <span className="text-muted-foreground">(optional)</span></Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button></form></DialogContent></Dialog><ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Deactivate user?" description={`Deactivate ${selected?.firstName} ${selected?.lastName}? They will no longer be able to sign in.`} confirmLabel="Deactivate" onConfirm={remove} loading={saving} /></div>;
}
