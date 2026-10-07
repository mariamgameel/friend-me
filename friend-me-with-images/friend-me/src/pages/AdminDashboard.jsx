import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../api/axios";
import { getAllDogs, createDog, updateDog, deleteDog } from "../api/dogs";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../api/products";
import { getAllRequests, updateRequestStatus } from "../api/adoption";
import { getAllOrders, updateOrderStatus } from "../api/orders";
import { getAllMessages, markMessageRead, deleteMessage } from "../api/contact";
import { getAllUsers } from "../api/users";
import { useToast } from "../components/ui/Toast";
import { getErrorMessage } from "../utils/error";
import useDocumentTitle from "../hooks/useDocumentTitle";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import FormField from "../components/ui/FormField";
import EmptyState from "../components/ui/EmptyState";
import Avatar, { Spinner } from "../components/ui/Avatar";
import {
  LayoutDashboard,
  FileText,
  Heart,
  Package,
  ShoppingBag,
  Mail,
  Users,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  ExternalLink,
  Shield,
  Eye,
  Check,
  X,
  Clock,
  Home,
  MapPin,
  Calendar,
} from "lucide-react";
import "./AdminDashboard.css";

const STATUS_PIE_COLORS = {
  Pending: "#d97706",
  Approved: "#15803d",
  Rejected: "#dc2626",
  Cancelled: "#64748b",
};

const EMPTY_DOG = {
  name: "",
  age: "",
  breed: "",
  gender: "Male",
  size: "Medium",
  energyLevel: "Medium",
  healthStatus: "Healthy",
  description: "",
  shelterLocation: "Main Shelter",
  image: "",
  vaccinated: true,
  neutered: true,
  goodWithKids: true,
  goodWithDogs: true,
  goodWithCats: false,
  personalityTags: "",
};

const EMPTY_PRODUCT = {
  name: "",
  category: "Food",
  price: "",
  stock: 10,
  description: "",
  image: "",
  featured: false,
};

export default function AdminDashboard() {
  useDocumentTitle("Admin Dashboard | friend.me");
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  // Filters & Search
  const [reqStatusFilter, setReqStatusFilter] = useState("all");
  const [reqSearch, setReqSearch] = useState("");
  const [dogSearch, setDogSearch] = useState("");
  const [prodSearch, setProdSearch] = useState("");
  const [prodCatFilter, setProdCatFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Modals state
  const [dogModalOpen, setDogModalOpen] = useState(false);
  const [editingDog, setEditingDog] = useState(null);
  const [dogForm, setDogForm] = useState(EMPTY_DOG);
  const [uploadingDogImg, setUploadingDogImg] = useState(false);

  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState(null);
  const [prodForm, setProdForm] = useState(EMPTY_PRODUCT);
  const [uploadingProdImg, setUploadingProdImg] = useState(false);

  const [reqDrawerOpen, setReqDrawerOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [updatingReq, setUpdatingReq] = useState(false);

  // Confirm dialogs
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "danger",
    confirmText: "Confirm",
  });

  const loadAllData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [statsRes, reqsRes, dogsRes, prodsRes, ordersRes, msgsRes, usersRes] =
        await Promise.allSettled([
          api.get("/admin/stats"),
          getAllRequests(),
          getAllDogs({ limit: 100 }),
          getProducts({ limit: 100 }),
          getAllOrders({ limit: 100 }),
          getAllMessages(),
          getAllUsers(),
        ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value.data?.data || null);
      if (reqsRes.status === "fulfilled") setRequests(reqsRes.value.data?.data || []);
      if (dogsRes.status === "fulfilled") setDogs(dogsRes.value.data?.data || []);
      if (prodsRes.status === "fulfilled") setProducts(prodsRes.value.data?.data || []);
      if (ordersRes.status === "fulfilled") setOrders(ordersRes.value.data?.data || []);
      if (msgsRes.status === "fulfilled") setMessages(msgsRes.value.data?.data || []);
      if (usersRes.status === "fulfilled") setUsers(usersRes.value.data?.data || []);
    } catch (err) {
      toast.error("Failed to load some dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Quick Image Upload
  const handleFileUpload = async (file, type = "dog") => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    const setUploading = type === "dog" ? setUploadingDogImg : setUploadingProdImg;
    setUploading(true);

    try {
      const res = await api.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data?.data?.imageUrl || res.data?.imageUrl;
      if (url) {
        if (type === "dog") {
          setDogForm((prev) => ({ ...prev, image: url }));
        } else {
          setProdForm((prev) => ({ ...prev, image: url }));
        }
        toast.success("Image uploaded successfully!");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload image. Max size 3MB (JPEG/PNG/WEBP)"));
    } finally {
      setUploading(false);
    }
  };

  // Dog Actions
  const handleOpenDogModal = (dog = null) => {
    if (dog) {
      setEditingDog(dog);
      setDogForm({
        name: dog.name || "",
        age: dog.age || "",
        breed: dog.breed || "",
        gender: dog.gender || "Male",
        size: dog.size || "Medium",
        energyLevel: dog.energyLevel || "Medium",
        healthStatus: dog.healthStatus || "Healthy",
        description: dog.description || "",
        shelterLocation: dog.shelterLocation || "Main Shelter",
        image: dog.image || "",
        vaccinated: dog.vaccinated ?? true,
        neutered: dog.neutered ?? true,
        goodWithKids: dog.goodWithKids ?? true,
        goodWithDogs: dog.goodWithDogs ?? true,
        goodWithCats: dog.goodWithCats ?? false,
        personalityTags: Array.isArray(dog.personalityTags)
          ? dog.personalityTags.join(", ")
          : dog.personalityTags || "",
      });
    } else {
      setEditingDog(null);
      setDogForm(EMPTY_DOG);
    }
    setDogModalOpen(true);
  };

  const handleSaveDog = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...dogForm,
        age: Number(dogForm.age),
        personalityTags: dogForm.personalityTags
          ? dogForm.personalityTags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      if (editingDog) {
        await updateDog(editingDog._id, payload);
        toast.success(`Updated ${payload.name} successfully!`);
      } else {
        await createDog(payload);
        toast.success(`Added ${payload.name} to rescue shelter!`);
      }
      setDogModalOpen(false);
      loadAllData(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save dog"));
    }
  };

  const handleDeleteDog = (dog) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Dog "${dog.name}"?`,
      message: "Are you sure you want to remove this dog? This cannot be undone.",
      variant: "danger",
      confirmText: "Delete Dog",
      onConfirm: async () => {
        try {
          await deleteDog(dog._id);
          toast.success("Dog removed successfully");
          loadAllData(true);
        } catch (err) {
          toast.error(getErrorMessage(err, "Failed to delete dog"));
        }
      },
    });
  };

  // Product Actions
  const handleOpenProdModal = (prod = null) => {
    if (prod) {
      setEditingProd(prod);
      setProdForm({
        name: prod.name || "",
        category: prod.category || "Food",
        price: prod.price || "",
        stock: prod.stock ?? 10,
        description: prod.description || "",
        image: prod.image || "",
        featured: prod.featured ?? false,
      });
    } else {
      setEditingProd(null);
      setProdForm(EMPTY_PRODUCT);
    }
    setProdModalOpen(true);
  };

  const handleSaveProd = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...prodForm,
        price: Number(prodForm.price),
        stock: Number(prodForm.stock),
      };

      if (editingProd) {
        await updateProduct(editingProd._id, payload);
        toast.success(`Updated ${payload.name} successfully!`);
      } else {
        await createProduct(payload);
        toast.success(`Added ${payload.name} to shop!`);
      }
      setProdModalOpen(false);
      loadAllData(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save product"));
    }
  };

  const handleDeleteProd = (prod) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Product "${prod.name}"?`,
      message: "Are you sure you want to remove this product from the shop?",
      variant: "danger",
      confirmText: "Delete Product",
      onConfirm: async () => {
        try {
          await deleteProduct(prod._id);
          toast.success("Product removed");
          loadAllData(true);
        } catch (err) {
          toast.error(getErrorMessage(err, "Failed to delete product"));
        }
      },
    });
  };

  // Adoption Request Drawer & Status update
  const handleReviewReq = (req) => {
    setSelectedReq(req);
    setAdminNote(req.adminNote || "");
    setReqDrawerOpen(true);
  };

  const handleUpdateReqStatus = (status) => {
    if (!selectedReq) return;
    const isApproval = status === "Approved";

    setConfirmDialog({
      isOpen: true,
      title: isApproval ? "Approve Adoption Request?" : "Reject Adoption Request?",
      message: isApproval
        ? `Approving this request will mark "${selectedReq.dog?.name || "this dog"}" as adopted and automatically reject any other pending requests for this dog. Proceed?`
        : `Are you sure you want to reject this request from ${selectedReq.user?.username || "the applicant"}?`,
      variant: isApproval ? "primary" : "danger",
      confirmText: isApproval ? "Yes, Approve Request" : "Reject Request",
      onConfirm: async () => {
        setUpdatingReq(true);
        try {
          await updateRequestStatus(selectedReq._id, status, adminNote.trim());
          toast.success(`Application marked as ${status}`);
          setReqDrawerOpen(false);
          loadAllData(true);
        } catch (err) {
          toast.error(getErrorMessage(err, "Failed to update request status"));
        } finally {
          setUpdatingReq(false);
        }
      },
    });
  };

  // Order status update
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      loadAllData(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update order status"));
    }
  };

  // Message actions
  const handleMarkMsgRead = async (msgId) => {
    try {
      await markMessageRead(msgId);
      toast.success("Message marked as read");
      loadAllData(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update message"));
    }
  };

  const handleDeleteMsg = (msgId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Message?",
      message: "Are you sure you want to permanently delete this message?",
      variant: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await deleteMessage(msgId);
          toast.success("Message deleted");
          loadAllData(true);
        } catch (err) {
          toast.error(getErrorMessage(err, "Failed to delete message"));
        }
      },
    });
  };

  // Filtered Adoption Requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchStatus = reqStatusFilter === "all" || r.status.toLowerCase() === reqStatusFilter.toLowerCase();
      const applicantName = r.user?.username?.toLowerCase() || "";
      const applicantEmail = r.user?.email?.toLowerCase() || "";
      const dogName = r.dog?.name?.toLowerCase() || "";
      const search = reqSearch.toLowerCase();
      const matchSearch =
        !search ||
        applicantName.includes(search) ||
        applicantEmail.includes(search) ||
        dogName.includes(search);
      return matchStatus && matchSearch;
    });
  }, [requests, reqStatusFilter, reqSearch]);

  // Filtered Dogs
  const filteredDogs = useMemo(() => {
    return dogs.filter((d) => {
      const s = dogSearch.toLowerCase();
      return (
        !s ||
        d.name?.toLowerCase().includes(s) ||
        d.breed?.toLowerCase().includes(s) ||
        d.shelterLocation?.toLowerCase().includes(s)
      );
    });
  }, [dogs, dogSearch]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = prodCatFilter === "all" || p.category === prodCatFilter;
      const s = prodSearch.toLowerCase();
      const matchSearch = !s || p.name?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s);
      return matchCat && matchSearch;
    });
  }, [products, prodCatFilter, prodSearch]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      return orderStatusFilter === "all" || o.status.toLowerCase() === orderStatusFilter.toLowerCase();
    });
  }, [orders, orderStatusFilter]);

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const unreadMsgCount = messages.filter((m) => !m.isRead).length;

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <Spinner size={48} />
        <p>Loading administration dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-badge-row">
            <Shield size={18} className="shield-icon" />
            <span className="admin-title">Admin Console</span>
          </div>
          <span className="admin-subtitle">friend.me management</span>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <FileText size={18} />
            <span>Adoptions</span>
            {pendingCount > 0 && <span className="nav-count-badge warning">{pendingCount}</span>}
          </button>

          <button
            className={`admin-nav-item ${activeTab === "dogs" ? "active" : ""}`}
            onClick={() => setActiveTab("dogs")}
          >
            <Heart size={18} />
            <span>Dogs ({dogs.length})</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <Package size={18} />
            <span>Products ({products.length})</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag size={18} />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === "messages" ? "active" : ""}`}
            onClick={() => setActiveTab("messages")}
          >
            <Mail size={18} />
            <span>Messages</span>
            {unreadMsgCount > 0 && <span className="nav-count-badge primary">{unreadMsgCount}</span>}
          </button>

          <button
            className={`admin-nav-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={18} />
            <span>Users ({users.length})</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAllData(true)}
            loading={refreshing}
            className="refresh-btn"
          >
            <RefreshCw size={14} /> Refresh Data
          </Button>
        </div>
      </aside>

      {/* Main Admin View Area */}
      <main className="admin-main">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="admin-tab-content">
            <div className="tab-header">
              <div>
                <h1>Dashboard Overview</h1>
                <p>Real-time metrics, rescue operations, and shop activities</p>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
              <Card className="kpi-card">
                <div className="kpi-icon-wrap primary">
                  <Heart size={22} />
                </div>
                <div className="kpi-details">
                  <span className="kpi-title">Shelter Dogs</span>
                  <span className="kpi-value">{dogs.length}</span>
                  <span className="kpi-sub">
                    {dogs.filter((d) => !d.isAdopted).length} available &bull;{" "}
                    {dogs.filter((d) => d.isAdopted).length} adopted
                  </span>
                </div>
              </Card>

              <Card className="kpi-card">
                <div className="kpi-icon-wrap warning">
                  <FileText size={22} />
                </div>
                <div className="kpi-details">
                  <span className="kpi-title">Pending Requests</span>
                  <span className="kpi-value">{pendingCount}</span>
                  <span className="kpi-sub">{requests.length} total applications</span>
                </div>
              </Card>

              <Card className="kpi-card">
                <div className="kpi-icon-wrap secondary">
                  <Package size={22} />
                </div>
                <div className="kpi-details">
                  <span className="kpi-title">Store Products</span>
                  <span className="kpi-value">{products.length}</span>
                  <span className="kpi-sub">
                    {products.filter((p) => p.stock <= 3).length} low stock items
                  </span>
                </div>
              </Card>

              <Card className="kpi-card">
                <div className="kpi-icon-wrap blue">
                  <ShoppingBag size={22} />
                </div>
                <div className="kpi-details">
                  <span className="kpi-title">Customer Orders</span>
                  <span className="kpi-value">{orders.length}</span>
                  <span className="kpi-sub">
                    {orders.filter((o) => o.status === "Pending").length} pending delivery
                  </span>
                </div>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
              {/* Chart 1: 6-Month Trends */}
              <Card className="chart-card">
                <div className="chart-header">
                  <h3>6-Month Activity Trends</h3>
                  <span className="chart-sub">Adoptions vs Shop Orders</span>
                </div>
                <div className="chart-canvas-wrap">
                  {stats?.trends?.monthlyAdoptions ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={stats.trends.monthlyAdoptions.map((item, idx) => ({
                          month: item.month,
                          adoptions: item.count,
                          orders: stats.trends.monthlyOrders?.[idx]?.count || 0,
                        }))}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--surface-card)",
                            borderColor: "var(--border-subtle)",
                            borderRadius: "var(--radius-md)",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="adoptions"
                          name="Adoptions"
                          fill="var(--primary)"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="orders"
                          name="Orders"
                          fill="var(--secondary)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="chart-placeholder">Trend data will appear here</div>
                  )}
                </div>
              </Card>

              {/* Chart 2: Status Breakdown */}
              <Card className="chart-card">
                <div className="chart-header">
                  <h3>Adoption Request Distribution</h3>
                  <span className="chart-sub">By current application status</span>
                </div>
                <div className="chart-canvas-wrap">
                  {stats?.adoptionsByStatus && stats.adoptionsByStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={stats.adoptionsByStatus}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={45}
                          paddingAngle={3}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {stats.adoptionsByStatus.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={STATUS_PIE_COLORS[entry.status] || "#94a3b8"}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="chart-placeholder">No adoption status data recorded yet</div>
                  )}
                </div>
              </Card>
            </div>

            {/* Overview Lower Section: Low Stock & Recent Requests */}
            <div className="overview-lower-grid">
              {/* Low Stock Alerts */}
              <Card className="overview-box">
                <div className="box-header">
                  <div className="box-title-row">
                    <AlertTriangle size={18} className="warning-icon" />
                    <h3>Low Stock Alerts</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("products")}>
                    Manage Products
                  </Button>
                </div>
                {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                  <div className="stock-alert-list">
                    {stats.lowStockProducts.map((p) => (
                      <div key={p._id} className="stock-alert-item">
                        <div className="stock-alert-info">
                          <span className="stock-name">{p.name}</span>
                          <span className="stock-cat">{p.category} &bull; ${p.price}</span>
                        </div>
                        <Badge variant={p.stock === 0 ? "danger" : "warning"}>
                          {p.stock === 0 ? "Out of Stock" : `${p.stock} units left`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-mini">All shop items have healthy inventory levels.</p>
                )}
              </Card>

              {/* Recent Requests */}
              <Card className="overview-box">
                <div className="box-header">
                  <div className="box-title-row">
                    <Clock size={18} />
                    <h3>Recent Adoption Applications</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("requests")}>
                    View All ({requests.length})
                  </Button>
                </div>
                {requests.slice(0, 4).map((r) => (
                  <div key={r._id} className="recent-req-item">
                    <Avatar name={r.user?.username || "User"} size={36} />
                    <div className="recent-req-info">
                      <div className="req-name-dog">
                        <strong>{r.user?.username}</strong> applied for{" "}
                        <span className="dog-highlight">{r.dog?.name || "a dog"}</span>
                      </div>
                      <span className="req-time">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleReviewReq(r)}>
                      Review
                    </Button>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: ADOPTION REQUESTS */}
        {activeTab === "requests" && (
          <div className="admin-tab-content">
            <div className="tab-header">
              <div>
                <h1>Adoption Applications</h1>
                <p>Review candidate applications and approve or reject adoptions</p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="admin-filter-bar">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search applicant or dog..."
                  value={reqSearch}
                  onChange={(e) => setReqSearch(e.target.value)}
                />
              </div>

              <div className="filter-pills">
                {["all", "Pending", "Approved", "Rejected", "Cancelled"].map((st) => (
                  <button
                    key={st}
                    className={`filter-pill ${reqStatusFilter === st ? "active" : ""}`}
                    onClick={() => setReqStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            {filteredRequests.length > 0 ? (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Dog</th>
                      <th>Applicant</th>
                      <th>Contact</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((r) => (
                      <tr key={r._id}>
                        <td>
                          <div className="table-dog-cell">
                            {r.dog?.image ? (
                              <img src={r.dog.image} alt={r.dog.name} className="table-thumb" />
                            ) : (
                              <div className="table-thumb-placeholder">🐕</div>
                            )}
                            <div>
                              <strong>{r.dog?.name || "Unknown Dog"}</strong>
                              <span className="table-sub">{r.dog?.breed}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="applicant-cell">
                            <strong>{r.user?.username || "Unknown"}</strong>
                            <span className="table-sub">{r.user?.email}</span>
                          </div>
                        </td>
                        <td>{r.application?.phone || "—"}</td>
                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Badge
                            variant={
                              r.status === "Approved"
                                ? "success"
                                : r.status === "Pending"
                                ? "warning"
                                : r.status === "Rejected"
                                ? "danger"
                                : "neutral"
                            }
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="outline" size="sm" onClick={() => handleReviewReq(r)}>
                            <Eye size={14} /> Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="No adoption requests found"
                description="There are currently no requests matching your filter criteria."
              />
            )}
          </div>
        )}

        {/* TAB 3: DOGS */}
        {activeTab === "dogs" && (
          <div className="admin-tab-content">
            <div className="tab-header">
              <div>
                <h1>Shelter Dogs</h1>
                <p>Manage rescue companions available for adoption</p>
              </div>
              <Button variant="primary" onClick={() => handleOpenDogModal()}>
                <Plus size={16} /> Add New Dog
              </Button>
            </div>

            <div className="admin-filter-bar">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by dog name, breed or shelter..."
                  value={dogSearch}
                  onChange={(e) => setDogSearch(e.target.value)}
                />
              </div>
            </div>

            {filteredDogs.length > 0 ? (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Dog</th>
                      <th>Breed & Gender</th>
                      <th>Age</th>
                      <th>Health</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDogs.map((d) => (
                      <tr key={d._id}>
                        <td>
                          <div className="table-dog-cell">
                            {d.image ? (
                              <img src={d.image} alt={d.name} className="table-thumb" />
                            ) : (
                              <div className="table-thumb-placeholder">🐕</div>
                            )}
                            <div>
                              <strong>{d.name}</strong>
                              <span className="table-sub">{d.size || "Medium"}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          {d.breed} &bull; {d.gender}
                        </td>
                        <td>{d.age} {d.age === 1 ? "yr" : "yrs"}</td>
                        <td>
                          <Badge
                            variant={
                              d.healthStatus === "Healthy"
                                ? "success"
                                : d.healthStatus === "Special Needs"
                                ? "warning"
                                : "neutral"
                            }
                          >
                            {d.healthStatus || "Healthy"}
                          </Badge>
                        </td>
                        <td>{d.shelterLocation || "Main Shelter"}</td>
                        <td>
                          <Badge variant={d.isAdopted ? "neutral" : "primary"}>
                            {d.isAdopted ? "Adopted" : "Available"}
                          </Badge>
                        </td>
                        <td>
                          <div className="action-buttons-cell">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDogModal(d)}
                              aria-label="Edit Dog"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDog(d)}
                              className="delete-action-btn"
                              aria-label="Delete Dog"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Heart}
                title="No dogs found"
                description="Try clearing your search query or add a new shelter dog."
                actionLabel="Add Dog"
                onAction={() => handleOpenDogModal()}
              />
            )}
          </div>
        )}

        {/* TAB 4: PRODUCTS */}
        {activeTab === "products" && (
          <div className="admin-tab-content">
            <div className="tab-header">
              <div>
                <h1>Store Products</h1>
                <p>Manage pet shop supplies, food, and accessories</p>
              </div>
              <Button variant="primary" onClick={() => handleOpenProdModal()}>
                <Plus size={16} /> Add Product
              </Button>
            </div>

            <div className="admin-filter-bar">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                />
              </div>

              <div className="filter-pills">
                {["all", "Food", "Toys", "Accessories", "Grooming", "Healthcare", "Beds & Crates"].map(
                  (c) => (
                    <button
                      key={c}
                      className={`filter-pill ${prodCatFilter === c ? "active" : ""}`}
                      onClick={() => setProdCatFilter(c)}
                    >
                      {c}
                    </button>
                  )
                )}
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div className="table-dog-cell">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="table-thumb" />
                            ) : (
                              <div className="table-thumb-placeholder">📦</div>
                            )}
                            <div>
                              <strong>{p.name}</strong>
                              <span className="table-sub table-ellipsis">{p.description}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge variant="neutral">{p.category || "General"}</Badge>
                        </td>
                        <td>
                          <strong>${Number(p.price).toFixed(2)}</strong>
                        </td>
                        <td>
                          <Badge
                            variant={
                              p.stock === 0
                                ? "danger"
                                : p.stock <= 3
                                ? "warning"
                                : "success"
                            }
                          >
                            {p.stock === 0 ? "Out of stock" : `${p.stock} units`}
                          </Badge>
                        </td>
                        <td>{p.featured ? <Badge variant="primary">★ Featured</Badge> : "—"}</td>
                        <td>
                          <div className="action-buttons-cell">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenProdModal(p)}
                              aria-label="Edit Product"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProd(p)}
                              className="delete-action-btn"
                              aria-label="Delete Product"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No products found"
                description="No products match your search or filter settings."
                actionLabel="Add Product"
                onAction={() => handleOpenProdModal()}
              />
            )}
          </div>
        )}

        {/* TAB 5: ORDERS */}
        {activeTab === "orders" && (
          <div className="admin-tab-content">
            <div className="tab-header">
              <div>
                <h1>Customer Orders</h1>
                <p>Track purchases and fulfill customer orders</p>
              </div>
            </div>

            <div className="admin-filter-bar">
              <div className="filter-pills">
                {["all", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
                  <button
                    key={st}
                    className={`filter-pill ${orderStatusFilter === st ? "active" : ""}`}
                    onClick={() => setOrderStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length > 0 ? (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o._id}>
                        <td>
                          <code>#{o._id.slice(-6).toUpperCase()}</code>
                        </td>
                        <td>
                          <div className="applicant-cell">
                            <strong>{o.user?.username || "Customer"}</strong>
                            <span className="table-sub">{o.shippingAddress?.city || "Local"}</span>
                          </div>
                        </td>
                        <td>
                          <span className="table-sub">
                            {o.items?.map((it) => `${it.product?.name || "Item"} (${it.quantity})`).join(", ")}
                          </span>
                        </td>
                        <td>
                          <strong>${Number(o.totalPrice).toFixed(2)}</strong>
                        </td>
                        <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td>
                          <select
                            className="order-status-select"
                            value={o.status}
                            onChange={(e) => handleOrderStatusChange(o._id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={ShoppingBag}
                title="No orders found"
                description="No orders match the selected filter."
              />
            )}
          </div>
        )}

        {/* TAB 6: MESSAGES */}
        {activeTab === "messages" && (
          <div className="admin-tab-content">
            <div className="tab-header">
              <div>
                <h1>Inbound Messages</h1>
                <p>Inquiries received from the public contact form</p>
              </div>
            </div>

            {messages.length > 0 ? (
              <div className="messages-list">
                {messages.map((m) => (
                  <Card key={m._id} className={`message-card ${!m.isRead ? "unread" : ""}`}>
                    <div className="message-header-row">
                      <div className="msg-sender">
                        <Avatar name={m.name} size={36} />
                        <div>
                          <strong>{m.name}</strong> &bull;{" "}
                          <span className="msg-email">{m.email}</span>
                        </div>
                      </div>
                      <div className="msg-meta-actions">
                        <span className="msg-date">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                        {!m.isRead && (
                          <Button variant="ghost" size="sm" onClick={() => handleMarkMsgRead(m._id)}>
                            <Check size={14} /> Mark Read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMsg(m._id)}
                          className="delete-action-btn"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    <div className="msg-subject">{m.subject || "General Inquiry"}</div>
                    <p className="msg-body">{m.message}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Mail}
                title="Inbox empty"
                description="No contact messages have been received yet."
              />
            )}
          </div>
        )}

        {/* TAB 7: USERS */}
        {activeTab === "users" && (
          <div className="admin-tab-content">
            <div className="tab-header">
              <div>
                <h1>Registered Users</h1>
                <p>Community members and platform administrators</p>
              </div>
            </div>

            {users.length > 0 ? (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div className="table-dog-cell">
                            <Avatar name={u.username} size={36} />
                            <strong>{u.username}</strong>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <Badge variant={u.role === "admin" ? "primary" : "neutral"}>
                            {u.role === "admin" ? "Admin" : "User"}
                          </Badge>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="No users found"
                description="No users are registered in the system."
              />
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: ADD / EDIT DOG */}
      <Modal
        isOpen={dogModalOpen}
        onClose={() => setDogModalOpen(false)}
        title={editingDog ? `Edit Dog: ${editingDog.name}` : "Add New Shelter Dog"}
      >
        <form onSubmit={handleSaveDog} className="modal-form">
          <div className="form-grid-2">
            <FormField label="Dog Name" required>
              <input
                type="text"
                value={dogForm.name}
                onChange={(e) => setDogForm({ ...dogForm, name: e.target.value })}
                placeholder="e.g. Bella"
                required
              />
            </FormField>

            <FormField label="Breed" required>
              <input
                type="text"
                value={dogForm.breed}
                onChange={(e) => setDogForm({ ...dogForm, breed: e.target.value })}
                placeholder="e.g. Golden Retriever"
                required
              />
            </FormField>
          </div>

          <div className="form-grid-3">
            <FormField label="Age (Years)" required>
              <input
                type="number"
                min="0"
                max="25"
                step="0.5"
                value={dogForm.age}
                onChange={(e) => setDogForm({ ...dogForm, age: e.target.value })}
                placeholder="e.g. 2"
                required
              />
            </FormField>

            <FormField label="Gender" required>
              <select
                value={dogForm.gender}
                onChange={(e) => setDogForm({ ...dogForm, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </FormField>

            <FormField label="Size">
              <select
                value={dogForm.size}
                onChange={(e) => setDogForm({ ...dogForm, size: e.target.value })}
              >
                <option value="Small">Small (&lt; 20 lbs)</option>
                <option value="Medium">Medium (20-50 lbs)</option>
                <option value="Large">Large (50-80 lbs)</option>
                <option value="Extra Large">Extra Large (80+ lbs)</option>
              </select>
            </FormField>
          </div>

          <div className="form-grid-2">
            <FormField label="Energy Level">
              <select
                value={dogForm.energyLevel}
                onChange={(e) => setDogForm({ ...dogForm, energyLevel: e.target.value })}
              >
                <option value="Low">Low (Couch Potato)</option>
                <option value="Medium">Medium (Daily walks)</option>
                <option value="High">High (Athletic & active)</option>
              </select>
            </FormField>

            <FormField label="Health Status">
              <select
                value={dogForm.healthStatus}
                onChange={(e) => setDogForm({ ...dogForm, healthStatus: e.target.value })}
              >
                <option value="Healthy">Healthy</option>
                <option value="Under Treatment">Under Treatment</option>
                <option value="Special Needs">Special Needs</option>
              </select>
            </FormField>
          </div>

          <FormField label="Shelter Location">
            <input
              type="text"
              value={dogForm.shelterLocation}
              onChange={(e) => setDogForm({ ...dogForm, shelterLocation: e.target.value })}
              placeholder="e.g. Central Haven Shelter, Sector 4"
            />
          </FormField>

          <FormField label="Personality Tags (comma-separated)">
            <input
              type="text"
              value={dogForm.personalityTags}
              onChange={(e) => setDogForm({ ...dogForm, personalityTags: e.target.value })}
              placeholder="e.g. Playful, Cuddle Bug, House-Trained, Loyal"
            />
          </FormField>

          <FormField label="About & Biography" required>
            <textarea
              rows={3}
              value={dogForm.description}
              onChange={(e) => setDogForm({ ...dogForm, description: e.target.value })}
              placeholder="Write a heartwarming story about this dog..."
              required
            />
          </FormField>

          {/* Image Upload / URL */}
          <FormField label="Dog Photo (Upload or image URL)">
            <div className="image-input-section">
              <div className="file-upload-row">
                <label className="upload-button-label">
                  <Upload size={16} />
                  {uploadingDogImg ? "Uploading..." : "Upload File"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    disabled={uploadingDogImg}
                    onChange={(e) => handleFileUpload(e.target.files[0], "dog")}
                  />
                </label>
                <span className="or-divider">or enter URL:</span>
              </div>
              <input
                type="url"
                value={dogForm.image}
                onChange={(e) => setDogForm({ ...dogForm, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
              {dogForm.image && (
                <div className="modal-img-preview">
                  <img src={dogForm.image} alt="Preview" />
                </div>
              )}
            </div>
          </FormField>

          {/* Behavioral / Compatibility Checkboxes */}
          <div className="checkboxes-grid">
            <label className="custom-check-label">
              <input
                type="checkbox"
                checked={dogForm.vaccinated}
                onChange={(e) => setDogForm({ ...dogForm, vaccinated: e.target.checked })}
              />
              <span>Vaccinated</span>
            </label>
            <label className="custom-check-label">
              <input
                type="checkbox"
                checked={dogForm.neutered}
                onChange={(e) => setDogForm({ ...dogForm, neutered: e.target.checked })}
              />
              <span>Spayed / Neutered</span>
            </label>
            <label className="custom-check-label">
              <input
                type="checkbox"
                checked={dogForm.goodWithKids}
                onChange={(e) => setDogForm({ ...dogForm, goodWithKids: e.target.checked })}
              />
              <span>Good with Kids</span>
            </label>
            <label className="custom-check-label">
              <input
                type="checkbox"
                checked={dogForm.goodWithDogs}
                onChange={(e) => setDogForm({ ...dogForm, goodWithDogs: e.target.checked })}
              />
              <span>Good with Dogs</span>
            </label>
            <label className="custom-check-label">
              <input
                type="checkbox"
                checked={dogForm.goodWithCats}
                onChange={(e) => setDogForm({ ...dogForm, goodWithCats: e.target.checked })}
              />
              <span>Good with Cats</span>
            </label>
          </div>

          <div className="modal-actions-row">
            <Button type="button" variant="ghost" onClick={() => setDogModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingDog ? "Save Changes" : "Create Dog"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADD / EDIT PRODUCT */}
      <Modal
        isOpen={prodModalOpen}
        onClose={() => setProdModalOpen(false)}
        title={editingProd ? `Edit Product: ${editingProd.name}` : "Add Store Product"}
      >
        <form onSubmit={handleSaveProd} className="modal-form">
          <div className="form-grid-2">
            <FormField label="Product Name" required>
              <input
                type="text"
                value={prodForm.name}
                onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                placeholder="e.g. Organic Puppy Kibble"
                required
              />
            </FormField>

            <FormField label="Category" required>
              <select
                value={prodForm.category}
                onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
              >
                <option value="Food">Food</option>
                <option value="Toys">Toys</option>
                <option value="Accessories">Accessories</option>
                <option value="Grooming">Grooming</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Beds & Crates">Beds & Crates</option>
              </select>
            </FormField>
          </div>

          <div className="form-grid-2">
            <FormField label="Price ($)" required>
              <input
                type="number"
                min="0.5"
                step="0.01"
                value={prodForm.price}
                onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                placeholder="24.99"
                required
              />
            </FormField>

            <FormField label="Stock Units" required>
              <input
                type="number"
                min="0"
                value={prodForm.stock}
                onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                required
              />
            </FormField>
          </div>

          <FormField label="Description" required>
            <textarea
              rows={3}
              value={prodForm.description}
              onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
              placeholder="Detailed description of features and usage..."
              required
            />
          </FormField>

          <FormField label="Product Image (Upload or URL)">
            <div className="image-input-section">
              <div className="file-upload-row">
                <label className="upload-button-label">
                  <Upload size={16} />
                  {uploadingProdImg ? "Uploading..." : "Upload File"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    disabled={uploadingProdImg}
                    onChange={(e) => handleFileUpload(e.target.files[0], "product")}
                  />
                </label>
                <span className="or-divider">or enter URL:</span>
              </div>
              <input
                type="url"
                value={prodForm.image}
                onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                placeholder="https://..."
              />
              {prodForm.image && (
                <div className="modal-img-preview">
                  <img src={prodForm.image} alt="Preview" />
                </div>
              )}
            </div>
          </FormField>

          <label className="custom-check-label">
            <input
              type="checkbox"
              checked={prodForm.featured}
              onChange={(e) => setProdForm({ ...prodForm, featured: e.target.checked })}
            />
            <span>Feature this item on homepage and shop highlight</span>
          </label>

          <div className="modal-actions-row">
            <Button type="button" variant="ghost" onClick={() => setProdModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingProd ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DRAWER / MODAL: ADOPTION APPLICATION REVIEW */}
      <Modal
        isOpen={reqDrawerOpen}
        onClose={() => setReqDrawerOpen(false)}
        title="Adoption Application Review"
      >
        {selectedReq && (
          <div className="review-drawer-content">
            {/* Header: Dog & Applicant */}
            <div className="review-hero">
              <div className="review-dog-info">
                {selectedReq.dog?.image && (
                  <img
                    src={selectedReq.dog.image}
                    alt={selectedReq.dog.name}
                    className="review-dog-avatar"
                  />
                )}
                <div>
                  <h3>Adopting {selectedReq.dog?.name || "Dog"}</h3>
                  <span className="review-dog-meta">
                    {selectedReq.dog?.breed} &bull; {selectedReq.dog?.age} yrs old
                  </span>
                </div>
              </div>

              <Badge
                variant={
                  selectedReq.status === "Approved"
                    ? "success"
                    : selectedReq.status === "Pending"
                    ? "warning"
                    : selectedReq.status === "Rejected"
                    ? "danger"
                    : "neutral"
                }
              >
                {selectedReq.status}
              </Badge>
            </div>

            {/* Applicant Contact Card */}
            <div className="review-section">
              <h4>Applicant Information</h4>
              <div className="review-info-grid">
                <div>
                  <span className="info-label">Name</span>
                  <span className="info-val">{selectedReq.user?.username || "—"}</span>
                </div>
                <div>
                  <span className="info-label">Email</span>
                  <span className="info-val">{selectedReq.user?.email || "—"}</span>
                </div>
                <div>
                  <span className="info-label">Phone</span>
                  <span className="info-val">{selectedReq.application?.phone || "—"}</span>
                </div>
                <div>
                  <span className="info-label">Submitted On</span>
                  <span className="info-val">
                    {new Date(selectedReq.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Housing & Lifestyle Details */}
            <div className="review-section">
              <h4>Household & Lifestyle</h4>
              <div className="review-info-grid">
                <div>
                  <span className="info-label">Housing Type</span>
                  <span className="info-val">{selectedReq.application?.housingType || "House"}</span>
                </div>
                <div>
                  <span className="info-label">Has Fenced Yard?</span>
                  <span className="info-val">
                    {selectedReq.application?.hasYard ? "Yes, fenced" : "No yard"}
                  </span>
                </div>
                <div>
                  <span className="info-label">Home Ownership</span>
                  <span className="info-val">
                    {selectedReq.application?.ownOrRent === "own" ? "Owns Home" : "Rents"}
                  </span>
                </div>
                <div>
                  <span className="info-label">Other Pets</span>
                  <span className="info-val">
                    {selectedReq.application?.otherPets || "None reported"}
                  </span>
                </div>
              </div>
            </div>

            {/* Application Questionnaire */}
            <div className="review-section">
              <h4>Experience & Motive</h4>
              <div className="review-q-block">
                <span className="info-label">Prior Pet Experience:</span>
                <p className="review-q-text">
                  {selectedReq.application?.experience || "No specific details provided."}
                </p>
              </div>
              <div className="review-q-block">
                <span className="info-label">Daily Schedule & Time Alone:</span>
                <p className="review-q-text">
                  {selectedReq.application?.schedule || "Standard daily schedule."}
                </p>
              </div>
              <div className="review-q-block">
                <span className="info-label">Reason for Adopting:</span>
                <p className="review-q-text">
                  {selectedReq.application?.reason || "Looking for a lifelong companion."}
                </p>
              </div>
            </div>

            {/* Status History Timeline */}
            {selectedReq.statusHistory && selectedReq.statusHistory.length > 0 && (
              <div className="review-section">
                <h4>Status Timeline</h4>
                <div className="status-timeline">
                  {selectedReq.statusHistory.map((h, i) => (
                    <div key={i} className="timeline-step">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <span className="timeline-status">{h.status}</span>
                        <span className="timeline-date">
                          {new Date(h.changedAt).toLocaleString()}
                        </span>
                        {h.note && <span className="timeline-note">"{h.note}"</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Note Input */}
            <div className="review-section">
              <FormField label="Administrator Note (Sent to applicant or internal log)">
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. Home check passed! Scheduled for pickup this Saturday."
                />
              </FormField>
            </div>

            {/* Action Buttons */}
            {selectedReq.status === "Pending" && (
              <div className="review-actions-bar">
                <Button
                  variant="outline"
                  onClick={() => handleUpdateReqStatus("Rejected")}
                  disabled={updatingReq}
                  className="reject-btn"
                >
                  <XCircle size={16} /> Reject Application
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleUpdateReqStatus("Approved")}
                  disabled={updatingReq}
                >
                  <CheckCircle size={16} /> Approve Adoption
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* CONFIRM ACTION DIALOG */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
      />
    </div>
  );
}
