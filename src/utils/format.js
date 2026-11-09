/**
 * Common formatting helpers for Currency, Date, and Numbers across the frontend.
 */

export const formatMoney = (val) => {
  return `${Number(val || 0).toLocaleString("vi-VN")} đ`;
};

export const formatDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hour}:${minute}`;
};

export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
};

export default {
  formatMoney,
  formatDateTime,
  formatDate,
};

