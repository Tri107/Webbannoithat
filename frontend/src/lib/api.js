const API_URL = "http://localhost:9999/api";

// Cập nhật hàm getAuthHeaders để nhận biết khi nào đang gửi file (FormData)
const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem("accessToken");
  const headers = {};
  
  // Trình duyệt sẽ tự động thiết lập Content-Type kèm boundary chính xác khi gửi FormData.
  // Do đó, chúng ta chỉ set Content-Type là application/json nếu KHÔNG phải là FormData.
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

// Bổ sung tham số isFormData vào apiFetch
const apiFetch = async (
  endpoint,
  method = "GET",
  body = null,
  isRetry = false,
  isFormData = false 
) => {
  const options = {
    method,
    headers: getAuthHeaders(isFormData),
    credentials: "include", // Cần thiết để gửi/nhận cookie (Refresh Token)
  };

  // Nếu có body, kiểm tra xem nó là FormData hay JSON để gán cho đúng
  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    let res = await fetch(`${API_URL}${endpoint}`, options);
    
    // ================= XỬ LÝ HẾT HẠN TOKEN =================
    if (res.status === 401 && !isRetry) {
      try {
        // Gọi API lấy token mới
        const refreshRes = await fetch(`${API_URL}/auth/refresh-token`, {
          method: "POST", // Lưu ý: Đảm bảo Backend của bạn dùng POST cho route này
          credentials: "include", 
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          // Cập nhật Token mới vào LocalStorage
          localStorage.setItem("accessToken", refreshData.accessToken);
          
          // Gọi lại API vừa bị lỗi với token mới
          return await apiFetch(endpoint, method, body, true, isFormData);
        } else {
          throw new Error("Refresh Token Expired");
        }
      } catch (refreshError) {
        // Nếu làm mới token thất bại (refresh token cũng hết hạn), đăng xuất người dùng
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
    }

    // ================= XỬ LÝ RESPONSE BÌNH THƯỜNG =================
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      throw new Error("Lỗi hệ thống: Phản hồi từ server không hợp lệ.");
    }

    if (!res.ok) {
      const errorMsg = data.message || `Lỗi ${res.status}: Thao tác thất bại`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ================= FAVORITE =================
// Đã chuyển sang dùng apiFetch để được tự động làm mới token
export const getFavorites = (accountId) => apiFetch(`/favorites/${accountId}`);

export const addFavorite = (accountId, productId) => 
  apiFetch("/favorites", "POST", { accountId, productId });

export const removeFavorite = (accountId, productId) => 
  apiFetch("/favorites", "DELETE", { accountId, productId });

// ================= UPLOAD IMAGES / 3D MODELS =================
// Đã chuyển sang dùng apiFetch với cờ isFormData = true

export const uploadProductImages = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  return apiFetch("/products/images", "POST", formData, false, true);
};

export const uploadProductModel3d = async (file) => {
  const formData = new FormData();
  formData.append("model3d", file);
  return apiFetch("/products/model3d", "POST", formData, false, true);
};

export const updateProductImages = async (variantRef, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  return apiFetch(`/products/images/${variantRef}`, "PUT", formData, false, true);
};

export const updateProductModel3d = async (variantRef, file) => {
  const formData = new FormData();
  formData.append("model3d", file);
  return apiFetch(`/products/model3d/${variantRef}`, "PUT", formData, false, true);
};

// ================= AUTH =================
export const registerUser = (data) => apiFetch("/auth/register", "POST", data);
export const loginUser    = (data) => apiFetch("/auth/login", "POST", data);
export const verifyOtp    = (data) => apiFetch("/auth/register/verify", "POST", data);
export const googleLogin  = (data) => apiFetch("/auth/google-login", "POST", data);
export const logoutUser   = () => apiFetch("/auth/logout", "POST"); 
export const getMyProfile = () => apiFetch("/profile/me", "GET");
export const updateProfile = (data) => apiFetch("/profile/update", "PUT", data);

// ================= DISCOUNT =================
export const getDiscounts = () => apiFetch("/discounts");
export const createDiscount = (data) => apiFetch("/discounts", "POST", data);
export const updateDiscount = (id, data) => apiFetch(`/discounts/${id}`, "PUT", data);
export const deleteDiscount = (id) => apiFetch(`/discounts/${id}`, "DELETE");

// ================= ACCOUNT (Admin) =================
export const getAccounts = () => apiFetch("/account");
export const getAccountById = (id) => apiFetch(`/account/${id}`);
export const createAccount = (data) => apiFetch("/account", "POST", data);
export const updateAccount = (id, data) => apiFetch(`/account/${id}`, "PUT", data);
export const changeAccountPassword = (id, data) => apiFetch(`/account/${id}/password`, "PUT", data);
export const deleteAccount = (id) => apiFetch(`/account/${id}`, "DELETE");
export const restoreAccount = (id) => apiFetch(`/account/${id}/restore`, "PATCH");

// ================= COLLECTION =================
export const getCollections = () => apiFetch("/collections");
export const createCollection = (data) => apiFetch("/collections", "POST", data);
export const updateCollection = (collectionId, data) => apiFetch(`/collections/${collectionId}`, "PUT", data);
export const deleteCollection = (collectionId) => apiFetch(`/collections/${collectionId}`, "DELETE");

// ================= PAYMENT =================
export const getPayments = () => apiFetch("/payments");
export const createPayment = (data) => apiFetch("/payments", "POST", data);
export const updatePayment = (paymentId, data) => apiFetch(`/payments/${paymentId}`, "PUT", data);
export const deletePayment = (paymentId) => apiFetch(`/payments/${paymentId}`, "DELETE");
export const createVnpayPaymentUrl = (data) => apiFetch("/vnpay/create-payment-url", "POST", data);

// ================= CATEGORY =================
export const getCategories = () => apiFetch("/categories");
export const createCategory = (data) => apiFetch("/categories", "POST", data);
export const updateCategory = (categoryId, data) => apiFetch(`/categories/${categoryId}`, "PUT", data);
export const deleteCategory = (categoryId) => apiFetch(`/categories/${categoryId}`, "DELETE");

// ================= BRAND =================
export const getBrands = () => apiFetch("/brands");
export const createBrand = (data) => apiFetch("/brands", "POST", data);
export const updateBrand = (brandId, data) => apiFetch(`/brands/${brandId}`, "PUT", data);
export const deleteBrand = (brandId) => apiFetch(`/brands/${brandId}`, "DELETE");

// ================= PRODUCT =================
export const getProducts = () => apiFetch("/products");
export const getProductById = (id) => apiFetch(`/products/${id}`);
export const getFeaturedProducts = (params = "") => apiFetch(`/products/home-featured${params ? `?${params}` : ""}`);
export const getHomeCollections = (params = "") => apiFetch(`/products/home-collections${params ? `?${params}` : ""}`);
export const createProduct = (data) => apiFetch("/products/add-product", "POST", data);
export const createVariant = (data) => apiFetch("/products/add-variant", "POST", data);
export const updateProduct = (id, data) => apiFetch(`/products/${id}`, "PUT", data);
export const updateVariant = (variantRef, data) => apiFetch(`/products/variant/${variantRef}`, "PUT", data);
export const deleteProduct = (id) => apiFetch(`/products/${id}`, "DELETE");

// ================= CHAT =================
export const getChatConversations = () => apiFetch("/chat/conversations/list");
export const getChatMessages = (conversationId) => apiFetch(`/chat/messages/${conversationId}`);
export const createOrGetConversation = (data) => apiFetch("/chat/conversation", "POST", data);

// ================= ORDER =================
export const getOrders = () => apiFetch("/orders");
export const getOrdersByUserId = (userId) => apiFetch(`/orders/user/${userId}`);
export const getOrderById = (id) => apiFetch(`/orders/${id}`);
export const createOrder = (data) => apiFetch("/orders", "POST", data);
export const updateOrderStatus = (id, data) => apiFetch(`/orders/${id}`, "PUT", data);

// ================= REVIEW =================
export const getReviews = (productId) => apiFetch(`/reviews${productId ? `?productId=${productId}` : ""}`);
export const getReviewPermission = (productId) => apiFetch(`/reviews/permission/${productId}`);
export const createReview = (data) => apiFetch("/reviews", "POST", data);
export const updateReview = (reviewId, data) => apiFetch(`/reviews/${reviewId}`, "PUT", data);
export const deleteReview = (reviewId) => apiFetch(`/reviews/${reviewId}`, "DELETE");

// ================= DASHBOARD =================
export const getWeeklyStats = () => apiFetch("/dashboard/weekly-stats");
export const getDashboardSummary = () => apiFetch("/dashboard/summary");
export const getChartData = (data) => apiFetch("/dashboard/chartdata", "POST", data);
