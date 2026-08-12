"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Star, Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/data-table/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { RowActions } from "@/components/data-table/row-action";

function ReviewStars({ rating }) { return <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />)}</div>; }

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]), [loading, setLoading] = useState(true), [selected, setSelected] = useState(null), [confirmOpen, setConfirmOpen] = useState(false), [viewOpen, setViewOpen] = useState(false), [deleting, setDeleting] = useState(false);
  const load = async () => { try { const { data } = await axios.get("/api/admin/reviews"); if (data.success) setReviews(data.data); } catch { toast.error("Failed to load reviews"); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const remove = async () => { setDeleting(true); try { await axios.delete(`/api/reviews/${selected.id}`); toast.success("Review deleted"); setConfirmOpen(false); load(); } catch { toast.error("Failed to delete review"); } finally { setDeleting(false); } };
  const columns = [
    { accessorKey: "product.name", header: "Product", cell: ({ row }) => <span className="font-medium max-w-[180px] truncate block">{row.original.product?.name}</span> },
    { accessorKey: "user.firstName", header: "Customer", cell: ({ row }) => <div><p className="text-sm font-medium">{row.original.user?.firstName} {row.original.user?.lastName}</p><p className="text-xs text-muted-foreground">{row.original.user?.email}</p></div> },
    { accessorKey: "rating", header: "Rating", cell: ({ row }) => <ReviewStars rating={row.original.rating} /> },
    { accessorKey: "title", header: "Review", cell: ({ row }) => <div className="max-w-[260px]"><p className="text-sm font-medium truncate">{row.original.title || "Untitled review"}</p><p className="text-xs text-muted-foreground truncate">{row.original.body || "—"}</p></div> },
    { accessorKey: "isVerified", header: "Verified", cell: ({ row }) => <span className={`text-xs font-medium ${row.original.isVerified ? "text-green-600" : "text-muted-foreground"}`}>{row.original.isVerified ? "Verified purchase" : "Unverified"}</span> },
    { accessorKey: "createdAt", header: "Date", cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString("en-IN")}</span> },
    { id: "actions", cell: ({ row }) => <RowActions row={row} actions={[{ label: "View review", onClick: (review) => { setSelected(review); setViewOpen(true); } }, { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: (review) => { setSelected(review); setConfirmOpen(true); }, destructive: true }]} /> },
  ];
  const average = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "0.0";
  return <div className="p-6 space-y-6"><div><h1 className="text-2xl font-semibold">Reviews</h1><p className="text-sm text-muted-foreground mt-1">Review and moderate customer feedback</p></div><div className="grid grid-cols-3 gap-4"><div className="bg-secondary rounded-lg p-4"><p className="text-sm text-muted-foreground">Total reviews</p><p className="text-2xl font-semibold">{reviews.length}</p></div><div className="bg-secondary rounded-lg p-4"><p className="text-sm text-muted-foreground">Average rating</p><p className="text-2xl font-semibold">{average} / 5</p></div><div className="bg-secondary rounded-lg p-4"><p className="text-sm text-muted-foreground">Verified purchases</p><p className="text-2xl font-semibold text-green-600">{reviews.filter((review) => review.isVerified).length}</p></div></div><Separator /><DataTable columns={columns} data={reviews} searchKey="title" searchPlaceholder="Search reviews..." isLoading={loading} /><Dialog open={viewOpen} onOpenChange={setViewOpen}><DialogContent><DialogHeader><DialogTitle>Review details</DialogTitle></DialogHeader>{selected && <div className="space-y-4"><div><p className="font-medium">{selected.product?.name}</p><p className="text-sm text-muted-foreground">By {selected.user?.firstName} {selected.user?.lastName}</p></div><ReviewStars rating={selected.rating} /><p className="font-medium">{selected.title || "Untitled review"}</p><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selected.body || "No review text provided."}</p></div>}</DialogContent></Dialog><ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Delete review?" description="This review will be permanently removed from the product and cannot be restored." confirmLabel="Delete" onConfirm={remove} loading={deleting} /></div>;
}
