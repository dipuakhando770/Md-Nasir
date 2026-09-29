import React, { useEffect, useState, useMemo } from 'react';
import {
  ShoppingCart,
  MessageCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  ExternalLink,
  Eye,
  Trash2,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar,
  CreditCard,
  User,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  ArrowUpDown,
  Send,
  X,
  ShieldCheck,
  Mail,
  Zap,
  Edit3,
  CheckSquare,
  Square,
  KeyRound,
  SlidersHorizontal,
  ChevronRight,
  Save,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { subscribeToOrders, updateOrderStatus, deleteOrder } from '../firebase/services';
import { formatPrice, formatDate, sanitizeWhatsAppNumber } from '../utils/formatters';
import { useStore } from '../context/StoreContext';
import { dispatchOrderDeliveryEmail } from '../utils/clientEmailDelivery';

export const OrdersManager: React.FC = () => {
  const { settings, products } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | 'pending' | 'confirmed' | 'processing' | 'paid' | 'cancelled'>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_amount'>('newest');

  // Interactive selection & Email Dispatch
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState<string | null>(null);
  const [emailSendingOrderId, setEmailSendingOrderId] = useState<string | null>(null);
  const [emailDeliveryFeedback, setEmailDeliveryFeedback] = useState<{
    orderId: string;
    success: boolean;
    message: string;
  } | null>(null);

  // Order Details Modal editable state
  const [customEmailInput, setCustomEmailInput] = useState<string>('');
  const [editTrxId, setEditTrxId] = useState<string>('');
  const [editCustomerNote, setEditCustomerNote] = useState<string>('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  // Bulk selection state
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  useEffect(() => {
    const unsub = subscribeToOrders(
      (newOrders) => {
        setOrders(newOrders);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching orders:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Open Order Modal and sync edit form fields
  const handleOpenOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setCustomEmailInput((order as any).customerEmail || order.customerAddress || '');
    setEditTrxId(order.paymentTrxId || (order as any).transactionId || '');
    setEditCustomerNote(order.note || '');
  };

  // Status Change Handler with direct UI & Firestore sync
  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
    newPaymentStatus?: Order['paymentStatus']
  ) => {
    setIsUpdatingStatus(orderId);
    try {
      await updateOrderStatus(orderId, newStatus, newPaymentStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                ...(newPaymentStatus ? { paymentStatus: newPaymentStatus } : {}),
              }
            : null
        );
      }

      // If manually completed, notify admin
      if (newStatus === 'completed') {
        const targetOrder = orders.find((o) => o.id === orderId) || selectedOrder;
        if (targetOrder) {
          setEmailDeliveryFeedback({
            orderId,
            success: true,
            message: `✅ অর্ডার #${orderId.slice(0, 8)} সফলভাবে ম্যানুয়ালি অ্যাপ্রুভ (Approved & Completed) করা হয়েছে!`,
          });
        }
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Core Manual Approve & Deliver Workflow
  const handleApproveAndSendEmail = async (order: Order, overrideEmail?: string) => {
    let targetEmail =
      (overrideEmail || customEmailInput || (order as any).customerEmail || order.customerAddress || '').trim();

    // Check if targetEmail has valid email structure
    if (!targetEmail.includes('@')) {
      const emailMatch = (order.customerAddress || '').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        targetEmail = emailMatch[0];
      }
    }

    if (!targetEmail || !targetEmail.includes('@')) {
      const prompted = window.prompt(
        `গ্রাহক ${order.customerName || ''} এর ইমেইল এড্রেস দিন (ডিজিটাল ফাইল ও লাইসেন্স পাঠানোর জন্য):`,
        ''
      );
      if (!prompted || !prompted.includes('@')) {
        // Still approve the order in DB even if email is skipped
        if (window.confirm('ইমেইল ছাড়া কি শুধুমাত্র অর্ডারটি ম্যানুয়ালি অ্যাপ্রুভ (Approve & Paid) করতে চান?')) {
          await handleStatusChange(order.id, 'completed', 'paid');
          return;
        }
        return;
      }
      targetEmail = prompted.trim();
    }

    setIsUpdatingStatus(order.id);
    setEmailSendingOrderId(order.id);
    setEmailDeliveryFeedback(null);

    try {
      // 1. Update Firestore Status to completed & paid
      await updateOrderStatus(order.id, 'completed', 'paid', {
        customerEmail: targetEmail,
        paymentTrxId: editTrxId || order.paymentTrxId || 'MANUAL-APPROVED',
        paymentMethod: order.paymentMethod || 'Manual Approved',
      });

      // 2. Enrich items with product download links if missing
      const enrichedItems = (order.items || []).map((item) => {
        const matched = products.find((p) => p.id === item.productId);
        return {
          ...item,
          downloadUrl: item.downloadUrl || matched?.downloadUrl || '',
          livePreviewUrl: item.livePreviewUrl || matched?.livePreviewUrl || '',
          imageUrl: item.imageUrl || matched?.imageUrl || '',
        };
      });

      // 3. Dispatch Delivery Email via Universal Hostinger Mail API Engine
      const emailResult = await dispatchOrderDeliveryEmail(
        {
          orderId: order.id,
          transactionId: editTrxId || (order as any).paymentTrxId || (order as any).transactionId || 'Admin Approved',
          customerName: order.customerName || 'সম্মানিত গ্রাহক',
          customerEmail: targetEmail,
          customerPhone: order.customerPhone,
          amount: Number(order.total) || 0,
          paymentMethod: order.paymentMethod || 'Manual Online Payment',
          items: enrichedItems,
          whatsappNumber: settings.whatsappNumber || '01962780922',
        },
        (settings.smtp as any)?.password || '4ea22f7ead670187bbb994158af679a61877a6df5affcaf3a3d710f9fc11edba'
      );

      if (emailResult.success) {
        setEmailDeliveryFeedback({
          orderId: order.id,
          success: true,
          message: `✅ অর্ডার #${order.id.slice(0, 8)} সফলভাবে ম্যানুয়ালি অনুমোদন করা হয়েছে এবং গ্রাহকের ইমেইল (${targetEmail})-এ ডাউনলোড লিঙ্ক ও ফাইল পৌঁছে গেছে!`,
        });
      } else {
        setEmailDeliveryFeedback({
          orderId: order.id,
          success: true,
          message: `✅ অর্ডার #${order.id.slice(0, 8)} ম্যানুয়ালি অনুমোদন ও পেইড হয়েছে! (ইমেইল স্ট্যাটাস: ${emailResult.error || emailResult.message || 'ডেলিভারি নোট সংরক্ষিত'})`,
        });
      }

      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: 'completed', paymentStatus: 'paid', customerEmail: targetEmail } : null
        );
      }
    } catch (err: any) {
      console.error('Failed to approve and send delivery email:', err);
      setEmailDeliveryFeedback({
        orderId: order.id,
        success: false,
        message: `ত্রুটি: ${err?.message || 'অ্যাপ্রুভ করতে ব্যর্থ হয়েছে'}`,
      });
    } finally {
      setIsUpdatingStatus(null);
      setEmailSendingOrderId(null);
    }
  };

  // Save Order Edit Details
  const handleSaveOrderDetails = async () => {
    if (!selectedOrder) return;
    setIsSavingDetails(true);
    try {
      await updateOrderStatus(selectedOrder.id, selectedOrder.status, selectedOrder.paymentStatus, {
        customerEmail: customEmailInput.trim(),
        paymentTrxId: editTrxId.trim(),
        note: editCustomerNote.trim(),
      });
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              customerEmail: customEmailInput.trim(),
              paymentTrxId: editTrxId.trim(),
              note: editCustomerNote.trim(),
            }
          : null
      );
      setEmailDeliveryFeedback({
        orderId: selectedOrder.id,
        success: true,
        message: `✅ অর্ডার #${selectedOrder.id.slice(0, 8)} এর তথ্য সফলভাবে আপডেট ও সংরক্ষিত হয়েছে।`,
      });
    } catch (err) {
      console.error('Failed to save order details:', err);
      alert('তথ্য সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই অর্ডার রেকর্ডটি মুছে ফেলতে চান?')) return;
    setIsDeletingOrder(orderId);
    try {
      await deleteOrder(orderId);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
      setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId));
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert('অর্ডার ডিলিট করতে সমস্যা হয়েছে।');
    } finally {
      setIsDeletingOrder(null);
    }
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedOrderIds.length === 0) return;
    if (!window.confirm(`আপনি কি নির্বাচিত ${selectedOrderIds.length} টি অর্ডার এক সাথে ম্যানুয়ালি অ্যাপ্রুভ করতে চান?`)) return;

    setIsBulkProcessing(true);
    try {
      for (const id of selectedOrderIds) {
        await updateOrderStatus(id, 'completed', 'paid');
      }
      setEmailDeliveryFeedback({
        orderId: 'bulk',
        success: true,
        message: `✅ ${selectedOrderIds.length} টি অর্ডার সফলভাবে একসাথে অ্যাপ্রুভ (Approved & Paid) করা হয়েছে!`,
      });
      setSelectedOrderIds([]);
    } catch (err) {
      console.error('Bulk approve error:', err);
      alert('বাল্ক অ্যাপ্রুভ করতে সমস্যা হয়েছে।');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrderIds.length === 0) return;
    if (!window.confirm(`⚠️ সতর্কতা: আপনি কি নির্বাচিত ${selectedOrderIds.length} টি অর্ডার স্থায়ীভাবে মুছে ফেলতে চান?`)) return;

    setIsBulkProcessing(true);
    try {
      for (const id of selectedOrderIds) {
        await deleteOrder(id);
      }
      setSelectedOrderIds([]);
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('অর্ডার ডিলিট করতে সমস্যা হয়েছে।');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Analytics & Summary Metrics calculations
  const metrics = useMemo(() => {
    const totalCount = orders.length;
    let totalRevenue = 0;
    let paidCount = 0;
    let paidRevenue = 0;
    let confirmedCount = 0;
    let confirmedRevenue = 0;
    let pendingCount = 0;
    let pendingRevenue = 0;
    let cancelledCount = 0;
    let cancelledRevenue = 0;

    orders.forEach((o) => {
      const amt = Number(o.total) || 0;
      totalRevenue += amt;

      const isPaid =
        o.status === 'completed' ||
        (o.paymentStatus as any) === 'paid' ||
        (o.paymentStatus as any) === 'completed';

      const isCancelled =
        o.status === 'cancelled' ||
        (o.paymentStatus as any) === 'cancelled' ||
        (o.paymentStatus as any) === 'failed';

      const isConfirmed = o.status === 'confirmed' || o.status === 'processing';

      if (isPaid) {
        paidCount++;
        paidRevenue += amt;
      } else if (isCancelled) {
        cancelledCount++;
        cancelledRevenue += amt;
      } else if (isConfirmed) {
        confirmedCount++;
        confirmedRevenue += amt;
      } else {
        pendingCount++;
        pendingRevenue += amt;
      }
    });

    const successRate = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

    return {
      totalCount,
      totalRevenue,
      paidCount,
      paidRevenue,
      confirmedCount,
      confirmedRevenue,
      pendingCount,
      pendingRevenue,
      cancelledCount,
      cancelledRevenue,
      successRate,
    };
  }, [orders]);

  // Filtered and Sorted Orders List
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const isPaid =
          order.status === 'completed' ||
          (order.paymentStatus as any) === 'paid' ||
          (order.paymentStatus as any) === 'completed';

        const isCancelled =
          order.status === 'cancelled' ||
          (order.paymentStatus as any) === 'cancelled' ||
          (order.paymentStatus as any) === 'failed';

        const isConfirmed = order.status === 'confirmed' || order.status === 'processing';
        const isPending = !isPaid && !isCancelled && !isConfirmed;

        if (selectedStatusTab === 'paid' && !isPaid) return false;
        if (selectedStatusTab === 'confirmed' && !isConfirmed) return false;
        if (selectedStatusTab === 'pending' && !isPending) return false;
        if (selectedStatusTab === 'cancelled' && !isCancelled) return false;

        // Payment method filter
        if (paymentMethodFilter !== 'all') {
          const methodLower = (order.paymentMethod || '').toLowerCase();
          if (paymentMethodFilter === 'paybd' && !methodLower.includes('paybd')) return false;
          if (paymentMethodFilter === 'bkash' && !methodLower.includes('bkash')) return false;
          if (paymentMethodFilter === 'nagad' && !methodLower.includes('nagad')) return false;
          if (paymentMethodFilter === 'rocket' && !methodLower.includes('rocket')) return false;
          if (paymentMethodFilter === 'whatsapp' && !methodLower.includes('whatsapp') && !methodLower.includes('chat')) return false;
        }

        // Search filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchId = (order.id || '').toLowerCase().includes(q);
          const matchName = (order.customerName || '').toLowerCase().includes(q);
          const matchPhone = (order.customerPhone || '').toLowerCase().includes(q);
          const matchEmail = ((order as any).customerEmail || order.customerAddress || '').toLowerCase().includes(q);
          const matchTrx = (order.paymentTrxId || (order as any).transactionId || '').toLowerCase().includes(q);
          const matchItems = (order.items || []).some((item) => item.title.toLowerCase().includes(q));
          if (!matchId && !matchName && !matchPhone && !matchEmail && !matchTrx && !matchItems) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
        if (sortBy === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
        if (sortBy === 'highest_amount') return (Number(b.total) || 0) - (Number(a.total) || 0);
        return 0;
      });
  }, [orders, selectedStatusTab, paymentMethodFilter, searchTerm, sortBy]);

  // Export Orders as CSV
  const exportToCSV = () => {
    if (orders.length === 0) {
      alert('এক্সপোর্ট করার মতো কোনো অর্ডার নেই।');
      return;
    }

    const headers = [
      'অর্ডার আইডি',
      'তারিখ ও সময়',
      'গ্রাহকের নাম',
      'মোবাইল নম্বর',
      'ইমেইল/ঠিকানা',
      'পণ্যসমূহ',
      'মোট বিল (৳)',
      'পেমেন্ট মেথড',
      'পেমেন্ট স্ট্যাটাস',
      'অর্ডার স্ট্যাটাস',
      'ট্রানজেকশন ID',
    ];

    const rows = filteredOrders.map((o) => [
      `"#${o.id}"`,
      `"${formatDate(o.createdAt)}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      `"${((o as any).customerEmail || o.customerAddress || '').replace(/"/g, '""')}"`,
      `"${(o.items || []).map((it) => `${it.title} (${it.quantity}টি)`).join('; ')}"`,
      `"${o.total || 0}"`,
      `"${o.paymentMethod || 'Online Payment'}"`,
      `"${o.paymentStatus || 'pending'}"`,
      `"${o.status || 'pending'}"`,
      `"${o.paymentTrxId || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nasir_Digital_Hub_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: OrderStatus, paymentStatus?: string) => {
    if (status === 'completed' || paymentStatus === 'paid' || paymentStatus === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>অনুমোদিত ও পেইড (Approved)</span>
        </span>
      );
    }
    if (status === 'confirmed' || status === 'processing') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/40">
          <Sparkles className="w-3.5 h-3.5" />
          <span>কনফার্মড / প্রসেসিং</span>
        </span>
      );
    }
    if (status === 'cancelled' || paymentStatus === 'cancelled' || paymentStatus === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40">
          <XCircle className="w-3.5 h-3.5" />
          <span>বাতিল / ব্যর্থ</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
        <Clock className="w-3.5 h-3.5" />
        <span>অপেক্ষমাণ (Pending)</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-indigo-400" />
              <span>অর্ডার ব্যবস্থাপনা ও ম্যানুয়াল অনুমোদন প্যানেল</span>
            </h2>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black">
              সর্বমোট ({orders.length})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            পেন্ডিং অর্ডার পর্যালোচনা করুন, এক ক্লিকে ম্যানুয়ালি অ্যাপ্রুভ করুন এবং গ্রাহকের ইমেইল ও WhatsApp-এ ফাইল সরবরাহ করুন
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {selectedOrderIds.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-indigo-500/40">
              <span className="text-xs font-bold text-indigo-300 px-2">
                {selectedOrderIds.length} টি সিলেক্টেড
              </span>
              <button
                type="button"
                onClick={handleBulkApprove}
                disabled={isBulkProcessing}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow transition-all cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>বাল্ক অ্যাপ্রুভ</span>
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isBulkProcessing}
                className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>মুছুন</span>
              </button>
            </div>
          )}

          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV রিপোর্ট এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Real-time Email & Status Feedback Banner */}
      {emailDeliveryFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold shadow-lg transition-all animate-fadeIn ${
            emailDeliveryFeedback.success
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {emailDeliveryFeedback.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{emailDeliveryFeedback.message}</span>
          </div>
          <button
            onClick={() => setEmailDeliveryFeedback(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Summary Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">সর্বমোট অর্ডার</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white">{metrics.totalCount} টি</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              মোট সেলস ভ্যালু: <strong className="text-indigo-300 font-bold">{formatPrice(metrics.totalRevenue)}</strong>
            </p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Pending Orders (Requires Admin Approval) */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              অপেক্ষমাণ (Pending Approval)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-amber-400">{metrics.pendingCount} টি</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              অনুমোদনের অপেক্ষায়: <strong className="text-amber-300 font-bold">{formatPrice(metrics.pendingRevenue)}</strong>
            </p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Confirmed Orders */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-sky-500/25 shadow-lg relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">✨ কনফার্মড / প্রসেসিং</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-sky-400">{metrics.confirmedCount} টি</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              প্রক্রিয়াধীন মূল্য: <strong className="text-sky-300 font-bold">{formatPrice(metrics.confirmedRevenue)}</strong>
            </p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Paid & Approved Orders */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">✅ অনুমোদিত ও পেইড</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-emerald-400">{metrics.paidCount} টি</h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {metrics.successRate}% সাফল্য
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              আদায়কৃত মূল্য: <strong className="text-emerald-300 font-bold">{formatPrice(metrics.paidRevenue)}</strong>
            </p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Filter and Search Bar Suite */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        {/* Status Tab Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setSelectedStatusTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedStatusTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              সকল ({orders.length})
            </button>
            <button
              onClick={() => setSelectedStatusTab('pending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedStatusTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-400 hover:text-white'
              }`}
            >
              <span>⏳ পেন্ডিং</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-200 text-[10px] font-black">
                {metrics.pendingCount}
              </span>
            </button>
            <button
              onClick={() => setSelectedStatusTab('confirmed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedStatusTab === 'confirmed'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-sky-400 hover:text-white'
              }`}
            >
              ✨ কনফার্মড ({metrics.confirmedCount})
            </button>
            <button
              onClick={() => setSelectedStatusTab('paid')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedStatusTab === 'paid'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-emerald-400 hover:text-white'
              }`}
            >
              ✅ অনুমোদিত ও পেইড ({metrics.paidCount})
            </button>
            <button
              onClick={() => setSelectedStatusTab('cancelled')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedStatusTab === 'cancelled'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-rose-400 hover:text-white'
              }`}
            >
              ❌ বাতিল ({metrics.cancelledCount})
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-bold cursor-pointer"
            >
              <option value="all">পেমেন্ট মেথড: সকল</option>
              <option value="paybd">PayBD অনলাইন গেটওয়ে</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
              <option value="whatsapp">WhatsApp / ম্যানুয়াল</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-bold cursor-pointer"
            >
              <option value="newest">সাজান: নতুন আগে</option>
              <option value="oldest">সাজান: পুরাতন আগে</option>
              <option value="highest_amount">সাজান: সর্বোচ্চ মূল্য</option>
            </select>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="অর্ডার আইডি (#ORD-...), কাস্টমার নাম, মোবাইল নম্বর, ইমেইল, ট্রানজেকশন ID বা প্রোডাক্টের নাম দিয়ে সার্চ করুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-4 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-white cursor-pointer"
                    title="সবগুলো সিলেক্ট করুন"
                  >
                    {filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4">অর্ডার আইডি ও তারিখ</th>
                <th className="py-4 px-4">গ্রাহকের প্রোফাইল ও ফোন</th>
                <th className="py-4 px-4">পণ্যসমূহ</th>
                <th className="py-4 px-4">মোট বিল ও মেথড</th>
                <th className="py-4 px-4">বর্তমান স্ট্যাটাস</th>
                <th className="py-4 px-4 text-right">⚡ ম্যানুয়াল অনুমোদন ও অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-7 h-7 animate-spin text-indigo-500" />
                      <span className="font-bold text-sm text-slate-300">অর্ডার ডাটাবেজ সিঙ্ক হচ্ছে...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-slate-500 italic">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-600" />
                      <span className="font-semibold">কোনো অর্ডার পাওয়া যায়নি। ফিল্টার পরিবর্তন করে দেখতে পারেন।</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const phoneClean = (order.customerPhone || '').replace(/[^0-9]/g, '');
                  const customerWhatsAppUrl = `https://wa.me/88${phoneClean}?text=${encodeURIComponent(
                    `👋 আসসালামু আলাইকুম ${order.customerName || ''}!\n` +
                    `📦 আপনার অর্ডার #${order.id.slice(0, 8)} সফলভাবে কনফার্ম/অ্যাপ্রুভ করা হয়েছে।\n` +
                    `💰 মোট মূল্য: ${formatPrice(order.total)}\n` +
                    `নাসির ডিজিটাল হাব এ অর্ডার করার জন্য ধন্যবাদ!`
                  )}`;

                  const isSelected = selectedOrderIds.includes(order.id);
                  const isCompleted = order.status === 'completed' || (order.paymentStatus as any) === 'paid';
                  const isPending = order.status === 'pending' || (!isCompleted && order.status !== 'cancelled' && order.status !== 'confirmed');

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-850/70 transition-colors group cursor-pointer ${
                        isSelected ? 'bg-indigo-950/20' : ''
                      }`}
                      onClick={() => handleOpenOrderModal(order)}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-4 px-4 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectOrder(order.id);
                        }}
                      >
                        <button type="button" className="text-slate-400 hover:text-white cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      </td>

                      {/* Order ID & Time */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                          <span className="bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-indigo-300">
                            #{order.id.slice(0, 10)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(order.id, `id_${order.id}`);
                            }}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="অর্ডার আইডি কপি করুন"
                          >
                            {copiedField === `id_${order.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-medium">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4">
                        <div className="font-black text-white text-xs flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{order.customerName || 'অনলাইন কাস্টমার'}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{order.customerPhone}</span>
                        </div>
                        {((order as any).customerEmail || order.customerAddress) && (
                          <div className="text-[10px] text-sky-400 font-mono truncate max-w-[170px] mt-0.5">
                            {(order as any).customerEmail || order.customerAddress}
                          </div>
                        )}
                      </td>

                      {/* Purchased Products */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5 max-w-[230px]">
                          {order.items?.map((item, i) => (
                            <div
                              key={i}
                              className="text-[11px] text-slate-200 truncate flex items-center justify-between gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800"
                            >
                              <span className="font-bold text-white truncate">• {item.title}</span>
                              <span className="text-indigo-400 font-black text-[10px] shrink-0">
                                ×{item.quantity} ({formatPrice(item.price)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount & Payment Method */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-black text-sm text-emerald-400">
                          {formatPrice(order.total)}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-indigo-400" />
                            <span>{order.paymentMethod || 'Online'}</span>
                          </span>
                        </div>
                        {order.paymentTrxId && (
                          <div className="text-[10px] font-mono text-emerald-400 mt-1 truncate max-w-[130px]">
                            Trx: {order.paymentTrxId}
                          </div>
                        )}
                      </td>

                      {/* Payment & Order Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                          <div>{getStatusBadge(order.status, order.paymentStatus)}</div>

                          <select
                            value={order.status}
                            disabled={isUpdatingStatus === order.id}
                            onChange={(e) => {
                              const val = e.target.value as OrderStatus;
                              handleStatusChange(
                                order.id,
                                val,
                                val === 'completed' ? 'paid' : val === 'cancelled' ? 'cancelled' : 'pending'
                              );
                            }}
                            className="bg-slate-950 border border-slate-800 text-[11px] font-bold rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="pending">⏳ অপেক্ষমাণ (Pending)</option>
                            <option value="confirmed">✨ কনফার্মড (Confirmed)</option>
                            <option value="completed">✅ অনুমোদিত (Completed & Paid)</option>
                            <option value="cancelled">❌ বাতিল (Cancelled)</option>
                          </select>
                        </div>
                      </td>

                      {/* Prominent Manual Approval & Live Action Toolbar */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* PRIMARY 1-CLICK MANUAL APPROVE BUTTON */}
                          {!isCompleted && (
                            <button
                              type="button"
                              onClick={() => handleApproveAndSendEmail(order)}
                              disabled={emailSendingOrderId === order.id || isUpdatingStatus === order.id}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                              title="অর্ডারটি ম্যানুয়ালি অ্যাপ্রুভ করুন এবং গ্রাহকের ইমেইলে ফাইল লিঙ্ক পাঠান"
                            >
                              {emailSendingOrderId === order.id || isUpdatingStatus === order.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Zap className="w-3.5 h-3.5 text-amber-300" />
                              )}
                              <span>ম্যানুয়াল অ্যাপ্রুভ</span>
                            </button>
                          )}

                          {isCompleted && (
                            <button
                              type="button"
                              onClick={() => handleApproveAndSendEmail(order)}
                              disabled={emailSendingOrderId === order.id}
                              className="px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                              title="গ্রাহককে পুনরায় ডেলিভারি ইমেইল পাঠান"
                            >
                              {emailSendingOrderId === order.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Mail className="w-3.5 h-3.5" />
                              )}
                              <span>পুনরায় ইমেইল</span>
                            </button>
                          )}

                          {/* Order Details View */}
                          <button
                            type="button"
                            onClick={() => handleOpenOrderModal(order)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="ইনভয়েস ও বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4 text-indigo-400" />
                          </button>

                          {/* WhatsApp Chat CTA */}
                          <a
                            href={customerWhatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 transition-colors cursor-pointer"
                            title="গ্রাহককে WhatsApp মেসেজ দিন"
                          >
                            <MessageCircle className="w-4 h-4 fill-[#25D366]" />
                          </a>

                          {/* Delete Order */}
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={isDeletingOrder === order.id}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                            title="অর্ডার রেকর্ড মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Order Details & Approval Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 text-white p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    অর্ডার ইনভয়েস ও ম্যানুয়াল অনুমোদন ড্যাশবোর্ড
                  </h3>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                    #{selectedOrder.id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>অর্ডারের সময়: {formatDate(selectedOrder.createdAt)}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PROMINENT MANUAL APPROVAL ACTION BOX (TOP HERO) */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-indigo-950/50 border-2 border-emerald-500/40 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white">
                      ম্যানুয়ালি অর্ডার অনুমোদন ও ডেলিভারি কন্ট্রোল
                    </h4>
                    <p className="text-[11px] text-emerald-300">
                      অ্যাডমিন যেকোনো অর্ডারকে সরাসরি অনুমোদন করে গ্রাহকের নিকট ডিজিটাল ফাইল পৌঁছাতে পারেন
                    </p>
                  </div>
                </div>

                <div>
                  {getStatusBadge(selectedOrder.status, selectedOrder.paymentStatus)}
                </div>
              </div>

              {/* Status Action Buttons Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-300 mr-1">এক ক্লিকে স্ট্যাটাস সেট করুন:</span>
                
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedOrder.id, 'pending', 'pending')}
                  disabled={isUpdatingStatus === selectedOrder.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedOrder.status === 'pending'
                      ? 'bg-amber-600 text-white border-amber-500 shadow'
                      : 'bg-slate-900 text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                  }`}
                >
                  ⏳ পেন্ডিং
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedOrder.id, 'confirmed', 'pending')}
                  disabled={isUpdatingStatus === selectedOrder.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedOrder.status === 'confirmed'
                      ? 'bg-sky-600 text-white border-sky-500 shadow'
                      : 'bg-slate-900 text-sky-400 border-sky-500/30 hover:bg-sky-500/10'
                  }`}
                >
                  ✨ কনফার্মড
                </button>

                <button
                  type="button"
                  onClick={() => handleApproveAndSendEmail(selectedOrder, customEmailInput)}
                  disabled={emailSendingOrderId === selectedOrder.id || isUpdatingStatus === selectedOrder.id}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 border border-emerald-400 transition-all cursor-pointer disabled:opacity-50"
                >
                  {emailSendingOrderId === selectedOrder.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  )}
                  <span>✅ অ্যাপ্রুভ ও ডেলিভারি দিন</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedOrder.id, 'cancelled', 'cancelled')}
                  disabled={isUpdatingStatus === selectedOrder.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedOrder.status === 'cancelled'
                      ? 'bg-rose-600 text-white border-rose-500 shadow'
                      : 'bg-slate-900 text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
                  }`}
                >
                  ❌ বাতিল
                </button>
              </div>

              {/* Editable Quick Fields: Email & Trx ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-sky-400" /> গ্রাহক ডেলিভারি ইমেইল এড্রেস:
                  </label>
                  <input
                    type="email"
                    value={customEmailInput}
                    onChange={(e) => setCustomEmailInput(e.target.value)}
                    placeholder="গ্রাহকের ইমেইল লিখুন..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> ট্রানজেকশন ID / পেমেন্ট রেফারেন্স:
                  </label>
                  <input
                    type="text"
                    value={editTrxId}
                    onChange={(e) => setEditTrxId(e.target.value)}
                    placeholder="যেমন: PayBD Verified / 9B7X2..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveOrderDetails}
                  disabled={isSavingDetails}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isSavingDetails ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApproveAndSendEmail(selectedOrder, customEmailInput)}
                  disabled={emailSendingOrderId === selectedOrder.id}
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ইমেইলে ফাইল পাঠান</span>
                </button>
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <User className="w-4 h-4" /> গ্রাহক ও যোগাযোগ তথ্য
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">নাম:</span>
                  <p className="font-bold text-white text-sm">{selectedOrder.customerName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">মোবাইল নম্বর:</span>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-bold text-white text-sm">{selectedOrder.customerPhone}</p>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.customerPhone, 'phone')}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px]">ইমেইল:</span>
                  <p className="font-mono font-semibold text-sky-400 text-xs">
                    {(selectedOrder as any).customerEmail || selectedOrder.customerAddress || 'ইমেইল দেওয়া নেই'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px]">পেমেন্ট মেথড:</span>
                  <p className="font-bold text-slate-200">{selectedOrder.paymentMethod || 'Online Payment'}</p>
                </div>

                {selectedOrder.customerAddress && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 text-[11px]">ঠিকানা:</span>
                    <p className="font-medium text-slate-200">{selectedOrder.customerAddress}</p>
                  </div>
                )}
                {selectedOrder.note && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 text-[11px]">গ্রাহকের নোট:</span>
                    <p className="text-slate-300 italic">{selectedOrder.note}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ordered Products & Digital Resources */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> অর্ডারকৃত ডিজিটাল পণ্য ও ডাউনলোড লিঙ্ক
              </h4>

              <div className="space-y-2.5">
                {selectedOrder.items?.map((item, idx) => {
                  const matchedProd = products.find((p) => p.id === item.productId);
                  const downloadLink = item.downloadUrl || matchedProd?.downloadUrl || '';
                  const livePreview = item.livePreviewUrl || matchedProd?.livePreviewUrl || '';

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
                          ) : (
                            <ShoppingCart className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <h5 className="font-black text-xs text-white">{item.title}</h5>
                          <p className="text-[11px] text-slate-400">
                            পরিমাণ: {item.quantity} | প্রতিটির মূল্য: {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {downloadLink ? (
                          <a
                            href={downloadLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>ডাউনলোড লিঙ্ক টেস্ট</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">কোনো লিঙ্ক যুক্ত নেই</span>
                        )}

                        {livePreview && (
                          <a
                            href={livePreview}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold flex items-center gap-1 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>ডেমো</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>সাবটোটাল:</span>
                <span className="font-bold">{formatPrice(selectedOrder.subtotal || selectedOrder.total)}</span>
              </div>
              {Number(selectedOrder.deliveryCharge) > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>ডেলিভারি চার্জ:</span>
                  <span>{formatPrice(selectedOrder.deliveryCharge)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-black text-sm pt-2 border-t border-slate-800">
                <span>মোট বিল:</span>
                <span className="text-emerald-400 text-base">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <a
                href={`https://wa.me/88${(selectedOrder.customerPhone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `👋 আসসালামু আলাইকুম ${selectedOrder.customerName || ''}!\n` +
                  `📦 আপনার অর্ডার #${selectedOrder.id.slice(0, 8)} সফলভাবে সম্পন্ন ও অ্যাক্টিভ করা হয়েছে।\n` +
                  `💰 মোট মূল্য: ${formatPrice(selectedOrder.total)}\n` +
                  `নাসির ডিজিটাল হাব এ সাথে থাকার জন্য ধন্যবাদ!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp এ ইনভয়েস পাঠান</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
