import { useRef, useState } from "react";
import styled from "styled-components";

export default function UploadSection() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [chapters, setChapters] = useState<{ page: number; title: string }[]>([
    { page: 1, title: "" },
  ]);

  const savePDFToIndexedDB = async (file: File, id: string) => {
    const db = await indexedDB.open("ReadningDB", 1);
    db.onupgradeneeded = () => {
      db.result.createObjectStore("books");
    };
    db.onsuccess = () => {
      const transaction = db.result.transaction("books", "readwrite");
      transaction.objectStore("books").put(file, id);
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setShowModal(true);
    }
  };

  const saveMetadataToLocalStorage = (id: string) => {
    const userBooks = JSON.parse(localStorage.getItem("userBooks") || "[]");
    const newBook = {
      id,
      title,
      author,
      isAI: true,
      pdfUrl: "", // 실제 PDF는 IndexedDB에서 불러옴
      coverUrl: coverUrl || "https://via.placeholder.com/150",
      chapters: chapters.map((ch) => ({
        ...ch,
        musicUrl: `https://ai.example.com/music/ch${ch.page}.mp3`,
      })),
    };
    localStorage.setItem("userBooks", JSON.stringify([...userBooks, newBook]));
  };

  const handleSubmit = async () => {
    if (!file) return;
    const id = `user-${Date.now()}`;
    await savePDFToIndexedDB(file, id);
    saveMetadataToLocalStorage(id);
    setShowModal(false);
    alert("책 업로드 완료 ✅");
  };

  return (
    <Wrapper>
      <Title>📤 책 파일 업로드</Title>
      <DropZone
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
        }}
        onDrop={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          const dropped = e.dataTransfer.files[0];
          if (dropped && dropped.type === "application/pdf") {
            setFile(dropped);
            setShowModal(true);
          }
        }}
      >
        <p>
          여기에서 <strong>드래그 앤 드롭</strong>으로 파일을 첨부하거나
        </p>
        <p>
          <AttachButton onClick={() => fileInputRef.current?.click()}>
            첨부하기
          </AttachButton>
        </p>
        <SupportText>📎 파일 지원 형식 : PDF만</SupportText>
        <HiddenInput
          type="file"
          ref={fileInputRef}
          accept=".pdf"
          onChange={handleFileUpload}
        />
      </DropZone>

      {showModal && (
        <ModalBackdrop>
          <Modal>
            <h3>책 정보 입력</h3>
            <input
              placeholder="책 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              placeholder="작가"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <input
              placeholder="표지 이미지 URL (선택)"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />

            <h4>📘 챕터 정보</h4>
            {chapters.map((ch, i) => (
              <div key={i}>
                <input
                  type="number"
                  placeholder="페이지 번호"
                  value={ch.page}
                  onChange={(e) =>
                    setChapters((prev) =>
                      prev.map((c, idx) =>
                        idx === i ? { ...c, page: +e.target.value } : c
                      )
                    )
                  }
                />
                <input
                  placeholder="챕터 제목"
                  value={ch.title}
                  onChange={(e) =>
                    setChapters((prev) =>
                      prev.map((c, idx) =>
                        idx === i ? { ...c, title: e.target.value } : c
                      )
                    )
                  }
                />
              </div>
            ))}
            <AddBtn
              onClick={() => setChapters([...chapters, { page: 1, title: "" }])}
            >
              ➕ 챕터 추가
            </AddBtn>
            <SubmitBtn onClick={handleSubmit}>✅ 저장하기</SubmitBtn>
          </Modal>
        </ModalBackdrop>
      )}
    </Wrapper>
  );
}

// 스타일 정의
const Wrapper = styled.section`
  width: 100%;
  text-align: center;
  margin-top: 3rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const DropZone = styled.div`
  padding: 8rem;
  border: 2px dashed #aaa;
  border-radius: 12px;
`;

const AttachButton = styled.button`
  background-color: #5f3dc4;
  color: white;
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
`;

const HiddenInput = styled.input`
  display: none;
`;

const SupportText = styled.p`
  margin-top: 1rem;
  color: #666;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
`;

const Modal = styled.div`
  background: white;
  padding: 2rem;
  width: 400px;
  margin: 5rem auto;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #aaa;
    border-radius: 6px;
  }
`;

const AddBtn = styled.button`
  background: #ddd;
  padding: 0.4rem;
  border-radius: 4px;
  cursor: pointer;
`;

const SubmitBtn = styled.button`
  background: #5f3dc4;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  padding: 0.6rem;
  cursor: pointer;
`;
