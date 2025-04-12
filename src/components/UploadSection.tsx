import { useRef, useState } from "react";
import styled from "styled-components";

export default function UploadSection() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (
      file &&
      (file.type === "text/plain" || file.type === "application/pdf")
    ) {
      console.log("📥 파일 첨부됨:", file.name);
      // 여기서 파일 처리 로직 실행
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (
      file &&
      (file.type === "text/plain" || file.type === "application/pdf")
    ) {
      console.log("✅ 파일 업로드:", file.name);
    }
  };

  return (
    <Wrapper>
      <Title>📤 책 파일 업로드</Title>
      <DropZone
        $dragging={isDragging}
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
          if (
            file &&
            (file.type === "text/plain" || file.type === "application/pdf")
          ) {
            console.log("📥 파일 첨부됨:", file.name);
            // 파일 처리 로직 실행
          }
        }}
      >
        <p>
          여기에서 <strong>드래그 앤 드롭</strong>으로 파일을 첨부하거나
        </p>
        <p>
          <AttachButton onClick={() => fileInputRef.current?.click()}>
            첨부하기
          </AttachButton>{" "}
          버튼을 눌러 첨부하세요.
        </p>
        <SupportText>📎 파일 지원 형식 : PDF, TXT</SupportText>
        <HiddenInput
          type="file"
          ref={fileInputRef}
          accept=".txt,.pdf"
          onChange={handleFileUpload}
        />
      </DropZone>
    </Wrapper>
  );
}

const Wrapper = styled.section`
  width: 100%;
  margin: 3rem 0 0 2rem;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.2rem;
  color: #3e2c1c;
  font-family: "Georgia", serif;
`;

const DropZone = styled.div<{ $dragging: boolean }>`
  padding: 10rem;
  border: 2px dashed #ccc;
  border-radius: 12px;
  background-color: ${({ $dragging }) => ($dragging ? "#f5f5f5" : "#fff")};
  transition: 0.3s ease;
  line-height: 1.8;

  p {
    margin: 0.5rem 0;
    font-size: 1rem;
    color: #333;
  }
`;

const AttachButton = styled.button`
  background-color: #5f3dc4;
  color: white;
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
`;

const SupportText = styled.p`
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #888;
`;

const HiddenInput = styled.input`
  display: none;
`;
