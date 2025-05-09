import { useRef, useState } from "react";
import styled from "styled-components";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UploadSection() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [musicPreferences, setMusicPreferences] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const validTypes = [
      "application/pdf",
      "text/plain",
      "application/epub+zip",
    ];
    const validExtensions = [".pdf", ".txt", ".epub"];

    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    const isValid =
      validTypes.includes(f.type) || validExtensions.includes(ext);

    if (isValid) {
      setFile(f);
      setShowModal(true);
    } else {
      alert("PDF, TXT 또는 EPUB 파일만 업로드할 수 있습니다.");
    }
  };

  const handleSubmit = async () => {
    const uid = localStorage.getItem("user_uid");
    if (!uid || !file) return;

    const id = `user-${Date.now()}`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("book_id", id);
    formData.append("preference", JSON.stringify(musicPreferences));

    console.log(file);
    console.log(id);
    console.log(musicPreferences);
    console.log(JSON.stringify(musicPreferences));

    try {
      const res = await fetch(
        "https://rjnrbqepcwsbaegk.tunnel.elice.io/proxy/8000/generate/music-v3",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("AI 서버 응답 실패");

      const { chapters } = await res.json(); // 📥 챕터 정보 자동 생성 결과

      // 1️⃣ Firebase Storage에 업로드
      const storage = getStorage();
      const ext = file.name.split(".").pop();
      const fileRef = ref(storage, `books/${id}.${ext}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      // 2️⃣ Firestore에 메타데이터 저장
      await setDoc(doc(db, "users", uid, "books", id), {
        id,
        title,
        author,
        isAI: true,
        pdfUrl: fileUrl,
        coverUrl: coverUrl || "https://via.placeholder.com/150",
        chapters,
        uploadedAt: new Date(),
      });

      alert("✅ 업로드 완료!");
      setShowModal(false);
    } catch (err) {
      console.error("❌ 에러 발생:", err);
      alert("업로드 중 오류가 발생했습니다.");
    }
  };

  const musicOptions = [
    "잔잔한 피아노",
    "자연 소리",
    "클래식",
    "재즈",
    "일렉트로닉",
    "몰입형 사운드",
  ];

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
        <SupportText>📎 파일 지원 형식: PDF, TXT, EPUB</SupportText>
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
            <ModalHeader>
              <h3>책 정보 입력</h3>
              <CloseBtn onClick={() => setShowModal(false)}>✖</CloseBtn>
            </ModalHeader>

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

            <h4>🎧 원하는 음악 스타일 선택</h4>
            <CheckboxGroup>
              {musicOptions.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={musicPreferences.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setMusicPreferences([...musicPreferences, option]);
                      } else {
                        setMusicPreferences(
                          musicPreferences.filter((o) => o !== option)
                        );
                      }
                    }}
                  />
                  {option}
                </label>
              ))}
            </CheckboxGroup>

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

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
  }
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.95rem;
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
  }
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

const SubmitBtn = styled.button`
  background: #5f3dc4;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  padding: 0.6rem;
  cursor: pointer;
`;
