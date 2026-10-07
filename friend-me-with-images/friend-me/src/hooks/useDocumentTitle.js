import { useEffect } from "react";

export function useDocumentTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | friend.me` : "friend.me – Adopt a Dog";
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}

export default useDocumentTitle;
