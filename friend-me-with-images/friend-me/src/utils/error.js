export function getErrorMessage(err, fallback = "An unexpected error occurred.") {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  
  const data = err.response?.data;
  if (data) {
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.join(", ");
    }
    if (data.message) return data.message;
    if (data.msg) return Array.isArray(data.msg) ? data.msg.join(", ") : data.msg;
  }
  
  if (err.message) return err.message;
  return fallback;
}
