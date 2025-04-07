import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ReaderPage() {
  const { bookId } = useParams();
  const [book, setBook] = useState<any>(null);

  useEffect(() => {
    const personal = JSON.parse(localStorage.getItem("uploadedBooks") || "[]");
    const found = personal.find((b: any) => b.id === bookId);
    if (found) setBook(found);
    // Firebase에서도 불러오도록 추가 가능
  }, [bookId]);

  if (!book) return <p>책을 불러오는 중...</p>;

  return (
    <div>
      <h2>{book.title}</h2>
      <p>{book.author}</p>
      <div>{book.content}</div>
    </div>
  );
}
