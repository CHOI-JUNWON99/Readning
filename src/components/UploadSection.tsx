import { useRef, useState } from "react";
import styled from "styled-components";

export default function UploadSection() {
  const [bookCount, setBookCount] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const title = `개인 책 ${bookCount}`;
      const newBook = {
        id: `personal-${Date.now()}`,
        title,
        author: "사용자 업로드",
        content,
        coverUrl:
          "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?fit=crop&w=300&q=80",
        isPersonal: true,
      };
      const storedBooks = JSON.parse(
        localStorage.getItem("uploadedBooks") || "[]"
      );
      const updated = [newBook, ...storedBooks];
      localStorage.setItem("uploadedBooks", JSON.stringify(updated));
      setBookCount(bookCount + 1);
      window.dispatchEvent(new Event("books-updated"));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "text/plain") {
      handleFile(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/plain") {
      handleFile(file);
    }
  };

  return (
    <Container
      onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === "text/plain") {
          handleFile(file);
        }
      }}
      $dragging={isDragging}
    >
      <h2>📄 txt 파일 업로드</h2>
      <p>텍스트 파일을 이 영역에 드래그하거나, 파일을 선택하세요.</p>
      <SelectButton onClick={() => fileInputRef.current?.click()}>
        파일 선택
      </SelectButton>
      <HiddenInput
        type="file"
        ref={fileInputRef}
        accept=".txt"
        onChange={handleFileUpload}
      />
    </Container>
  );
}

// ================= styled-components =================

const Container = styled.section<{ $dragging: boolean }>`
  max-width: 1000px;
  margin: 0rem 1rem 2.5rem 4rem;
  border: 2px dashed #aaa;
  padding: 2rem;
  background-color: ${({ $dragging }) => ($dragging ? "#f5f5f5" : "#fff")};
  transition: background-color 0.3s;
  border-radius: 10px;
  text-align: center;

  h2 {
    margin-bottom: 1rem;
    font-size: 1.4rem;
  }

  p {
    margin-bottom: 1rem;
    color: #333;
  }
`;

const SelectButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #d7c4a3;
  border: none;
  border-radius: 4px;
  color: #3e2c1c;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #cbb491;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;
