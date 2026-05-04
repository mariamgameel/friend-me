import { useEffect, useState } from "react";
import { getAllDogs, createDog, updateDog, deleteDog } from "../api/dogs";
import { getProducts, createProduct, deleteProduct } from "../api/products";
import { getAllRequests, updateRequestStatus } from "../api/adoption";
import { getAllUsers } from "../api/users";
import "./AdminDashboard.css";

const EMPTY_DOG = { name:"", age:"", breed:"", gender:"Male", description:"", healthStatus:"Healthy", image:"" };

function ImagePreview({ url }) {
  const [valid, setValid] = useState(false);
  useEffect(() => { setValid(false); if (url) setValid(true); }, [url]);
  if (!url) return (
    <div className="img-preview"><span className="img-preview-placeholder">🐕</span></div>
  );
  return (
    <div className="img-preview">
      <img src={url} alt="preview"
        onLoad={() => setValid(true)}
        onError={() => setValid(false)}
        style={{ display: valid ? "block" : "none" }}
      />
      {!valid && <span className="img-preview-placeholder">Invalid image URL ❌</span>}
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dogForm, setDogForm] = useState(EMPTY_DOG);
  const [productForm, setProductForm] = useState({ name:"", price:"", description:"", stock:0, image:"" });
  const [formMsg, setFormMsg] = useState("");

  
  const [editDog, setEditDog] = useState(null); 
  const [editForm, setEditForm] = useState(EMPTY_DOG);
  const [editMsg, setEditMsg] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, d, p, u] = await Promise.all([
        getAllRequests(), getAllDogs(), getProducts(), getAllUsers()
      ]);
      setRequests(r.data);
      setDogs(d.data);
      setProducts(p.data.data || p.data);
      setUsers(u.data.users || u.data);
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleStatusUpdate = async (id, status) => {
    await updateRequestStatus(id, status);
    loadData();
  };

  const handleCreateDog = async (e) => {
    e.preventDefault(); setFormMsg("");
    try {
      await createDog({ ...dogForm, age: Number(dogForm.age) });
      setFormMsg("Dog added successfully! ✅");
      loadData();
      setDogForm(EMPTY_DOG);
    } catch(err) {
      const msg = err.response?.data?.msg;
      setFormMsg("❌ " + (Array.isArray(msg) ? msg.join(", ") : msg || "An error occurred"));
    }
  };

  const openEdit = (dog) => {
    setEditDog(dog);
    setEditForm({
      name: dog.name, age: dog.age, breed: dog.breed,
      gender: dog.gender, description: dog.description,
      healthStatus: dog.healthStatus || "Healthy",
      image: dog.image || ""
    });
    setEditMsg("");
  };

  const handleEditSave = async (e) => {
    e.preventDefault(); setEditMsg(""); setEditLoading(true);
    try {
      await updateDog(editDog._id, { ...editForm, age: Number(editForm.age) });
      setEditMsg("Updated successfully! ✅");
      loadData();
      setTimeout(() => setEditDog(null), 800);
    } catch(err) {
      const msg = err.response?.data?.msg;
      setEditMsg("❌ " + (Array.isArray(msg) ? msg.join(", ") : msg || "An error occurred"));
    } finally { setEditLoading(false); }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault(); setFormMsg("");
    try {
      await createProduct({ ...productForm, price: Number(productForm.price), stock: Number(productForm.stock) });
      setFormMsg("Product added successfully! ✅");
      loadData();
      setProductForm({ name:"", price:"", description:"", stock:0, image:"" });
    } catch(err) {
      const msg = err.response?.data?.msg;
      setFormMsg("❌ " + (Array.isArray(msg) ? msg.join(", ") : msg || "An error occurred"));
    }
  };

  const tabs = ["requests","dogs","products","users"];

  return (
    <div className="page-container admin">
      <h1 className="admin-title">Admin Dashboard</h1>
      <div className="admin-tabs">
        {tabs.map(t => (
          <button key={t} className={`admin-tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setFormMsg(""); }}>
            {t === "requests" ? `Requests (${requests.filter(r=>r.status==="Pending").length})` :
             t === "dogs" ? `Dogs (${dogs.length})` :
             t === "products" ? `Products (${products.length})` :
             `Users (${users.length})`}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {tab === "requests" && (
            <div className="admin-section fade-up">
              <h2>Adoption Requests</h2>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>User</th><th>Dog</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                  <tbody>
                    {requests.length === 0 && (
                      <tr><td colSpan={5} style={{textAlign:"center",padding:"32px",color:"var(--gray)"}}>No requests found</td></tr>
                    )}
                    {requests.map(r => (
                      <tr key={r._id}>
                        <td><strong>{r.user?.username || "—"}</strong><br/><small style={{color:"var(--gray)"}}>{r.user?.email}</small></td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                            {r.dog?.image
                              ? <img src={r.dog.image} alt="" className="dog-thumb" />
                              : <div className="dog-thumb-placeholder">🐕</div>}
                            {r.dog?.name || "—"}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${r.status==="Approved"?"badge-green":r.status==="Rejected"?"badge-pink":"badge-yellow"}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>{new Date(r.createdAt).toLocaleDateString("ar-EG")}</td>
                        <td>
                          {r.status === "Pending" ? (
                            <div className="action-btns">
                              <button className="btn-small green" onClick={() => handleStatusUpdate(r._id, "Approved")}>Approve ✓</button>
                              <button className="btn-small red" onClick={() => handleStatusUpdate(r._id, "Rejected")}>Reject ✕</button>
                            </div>
                          ) : <span style={{color:"var(--gray)",fontSize:"13px"}}>Done</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "dogs" && (
            <div className="admin-section fade-up">
              <div className="admin-split">
                {/* Table */}
                <div>
                  <h2>Dogs({dogs.length})</h2>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>Image</th><th>Name</th><th>Breed</th><th>Age</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {dogs.length === 0 && (
                          <tr><td colSpan={6} style={{textAlign:"center",padding:"32px",color:"var(--gray)"}}>No dogs found</td></tr>
                        )}
                        {dogs.map(d => (
                          <tr key={d._id}>
                            <td>
                              {d.image
                                ? <img src={d.image} alt={d.name} className="dog-thumb"
                                    onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
                                  />
                                : null}
                              <div className="dog-thumb-placeholder" style={{display: d.image ? "none" : "flex"}}>🐕</div>
                            </td>
                            <td><strong>{d.name}</strong></td>
                            <td>{d.breed}</td>
                            <td>{d.age} yrs</td>
                            <td>
                              <span className={`badge ${d.isAdopted ? "badge-dark" : "badge-green"}`}>
                                {d.isAdopted ? "Adopted" : "Available"}
                              </span>
                            </td>
                            <td>
                              <div className="action-btns">
                                <button className="btn-small green" onClick={() => openEdit(d)}>Edit ✏️</button>
                                <button className="btn-small red" onClick={async () => { if(window.confirm(`Delete ${d.name}؟`)) { await deleteDog(d._id); loadData(); } }}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="admin-form-card">
                  <h3>Add New Dog ➕</h3>
                  {formMsg && <p className="form-msg">{formMsg}</p>}
                  <form onSubmit={handleCreateDog} className="admin-form">
                    <input placeholder="* Name" value={dogForm.name} onChange={e=>setDogForm({...dogForm,name:e.target.value})} required />
                    <input type="number" placeholder="Age (years) *" value={dogForm.age} onChange={e=>setDogForm({...dogForm,age:e.target.value})} required min="0" />
                    <input placeholder="Breed *" value={dogForm.breed} onChange={e=>setDogForm({...dogForm,breed:e.target.value})} required />
                    <select value={dogForm.gender} onChange={e=>setDogForm({...dogForm,gender:e.target.value})}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <textarea placeholder="Description *" value={dogForm.description} onChange={e=>setDogForm({...dogForm,description:e.target.value})} required rows={3} />
                    <input placeholder="Health Status" value={dogForm.healthStatus} onChange={e=>setDogForm({...dogForm,healthStatus:e.target.value})} />
                    <div className="img-url-field">
                      <label style={{fontSize:"12px",fontWeight:"600",color:"var(--gray)"}}>Image URL</label>
                      <input
                        placeholder="https://example.com/dog.jpg"
                        value={dogForm.image}
                        onChange={e=>setDogForm({...dogForm,image:e.target.value})}
                      />
                      <ImagePreview url={dogForm.image} />
                    </div>
                    <button type="submit" className="btn-primary">Add Dog</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {tab === "products" && (
            <div className="admin-section fade-up">
              <div className="admin-split">
                <div>
                  <h2>Products({products.length})</h2>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Stock</th><th></th></tr></thead>
                      <tbody>
                        {products.length === 0 && (
                          <tr><td colSpan={5} style={{textAlign:"center",padding:"32px",color:"var(--gray)"}}>No products found</td></tr>
                        )}
                        {products.map(p => (
                          <tr key={p._id}>
                            <td>
                              {p.image
                                ? <img src={p.image} alt={p.name} className="dog-thumb" onError={e=>e.target.style.display="none"} />
                                : <div className="dog-thumb-placeholder">🦴</div>}
                            </td>
                            <td><strong>{p.name}</strong><br/><small style={{color:"var(--gray)"}}>{p.description?.slice(0,40)}</small></td>
                            <td><strong>${p.price}</strong></td>
                            <td><span className={`badge ${p.stock>0?"badge-green":"badge-pink"}`}>{p.stock}</span></td>
                            <td><button className="btn-small red" onClick={async () => { if(window.confirm(`Delete${p.name}؟`)) { await deleteProduct(p._id); loadData(); }}}>🗑️</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="admin-form-card">
                  <h3>Add New Product ➕</h3>
                  {formMsg && <p className="form-msg">{formMsg}</p>}
                  <form onSubmit={handleCreateProduct} className="admin-form">
                    <input placeholder="Product Name *" value={productForm.name} onChange={e=>setProductForm({...productForm,name:e.target.value})} required />
                    <input type="number" placeholder="Price *" value={productForm.price} onChange={e=>setProductForm({...productForm,price:e.target.value})} required min="0" />
                    <textarea placeholder="Description" value={productForm.description} onChange={e=>setProductForm({...productForm,description:e.target.value})} rows={3} />
                    <input type="number" placeholder="Stock Quantity" value={productForm.stock} onChange={e=>setProductForm({...productForm,stock:e.target.value})} min="0" />
                    <div className="img-url-field">
                      <label style={{fontSize:"12px",fontWeight:"600",color:"var(--gray)"}}>Image URL</label>
                      <input
                        placeholder="https://example.com/product.jpg"
                        value={productForm.image}
                        onChange={e=>setProductForm({...productForm,image:e.target.value})}
                      />
                      <ImagePreview url={productForm.image} />
                    </div>
                    <button type="submit" className="btn-primary">Add Product</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="admin-section fade-up">
              <h2>Users({users.length})</h2>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Registration Date</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td><strong>{u.username}</strong></td>
                        <td>{u.email}</td>
                        <td><span className={`badge ${u.role==="admin"?"badge-dark":"badge-pink"}`}>{u.role}</span></td>
                        <td>{new Date(u.createdAt).toLocaleDateString("ar-EG")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {editDog && (
        <div className="edit-modal-overlay" onClick={e => { if(e.target === e.currentTarget) setEditDog(null); }}>
          <div className="edit-modal">
            <h3>Edit: ✏️ {editDog.name}</h3>
            {editMsg && <p className="form-msg">{editMsg}</p>}
            <form onSubmit={handleEditSave} className="admin-form">
              <input placeholder="* Name" value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} required />
              <input type="number" placeholder="* Age" value={editForm.age} onChange={e=>setEditForm({...editForm,age:e.target.value})} required min="0" />
              <input placeholder="* Breed" value={editForm.breed} onChange={e=>setEditForm({...editForm,breed:e.target.value})} required />
              <select value={editForm.gender} onChange={e=>setEditForm({...editForm,gender:e.target.value})}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <textarea placeholder="* Description" value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})} required rows={3} />
              <input placeholder="Health Status" value={editForm.healthStatus} onChange={e=>setEditForm({...editForm,healthStatus:e.target.value})} />

              <div className="img-url-field">
                <label style={{fontSize:"12px",fontWeight:"600",color:"var(--gray)"}}>Image URL</label>
                <input
                  placeholder="https://example.com/dog.jpg"
                  value={editForm.image}
                  onChange={e=>setEditForm({...editForm,image:e.target.value})}
                />
                <ImagePreview url={editForm.image} />
              </div>

              <div className="edit-modal-footer">
                <button type="button" className="btn-outline" onClick={() => setEditDog(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
