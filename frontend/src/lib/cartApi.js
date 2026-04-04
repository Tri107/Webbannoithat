const CART_API_URL = "http://localhost:9999/api/cart-items";

const getToken = () => {
  return localStorage.getItem("accessToken");
};

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "API error");
  }
  return res.json();
};

//
// ================= CART API =================
//

// GET cart
export const getCart = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const res = await fetch(`${CART_API_URL}/${user.id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(res);
};

// ADD to cart
export const addToCart = async (
  productId,
  quantity = 1,
  sku,
  price,
  color
) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const accountId = user.id;

  const res = await fetch(`${CART_API_URL}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      accountId,
      productId,
      quantity,
      sku,
      price,
      color
    }),
  });

  return handleResponse(res);
};

// UPDATE quantity
export const updateCartItem = async (cartItemId, quantity) => {
  const res = await fetch(`${CART_API_URL}/${cartItemId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      quantity,
    }),
  });

  return handleResponse(res);
};

// DELETE item
export const removeCartItem = async (productId) => {
  const res = await fetch(`${CART_API_URL}/${productId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  return handleResponse(res);
};

export const updateCartItemColor = async (cartItemId, color) => {
  const res = await fetch(`${CART_API_URL}/${cartItemId}/color`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ color }),
  });
  return handleResponse(res);
};

// CLEAR cart
export const clearCart = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const res = await fetch(`${CART_API_URL}/clear`, {
    method: "DELETE",
    headers: getHeaders(),
    body: JSON.stringify({ accountId: user.id })
  });

  return handleResponse(res);
};
