import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import styled from "styled-components";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { app } from "@/utils/firebase";
import TxtViewer from "./TxtViewer";
import EpubViewer from "../components/EpubViewer";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { BASE_AI_URL } from "../api/axiosInstance";
import { saveReadingProgress, getReadingProgress, updateReadingTime } from "@/utils/readingProgress";
import { getUserMusicPreferences } from "@/utils/musicPreferences";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type Chapter = {
  title: string;
  page: number;
  musicUrl: string;
};

type Book = {
  id: string;
  title: string;
  author: string;
  pdfUrl: string;
  name: string;
};

export default function ReaderPage() {
  // const BASE_AI_URL = "https://5961-114-246-205-231.ngrok-free.app";

  const { state } = useLocation();
  const book = state?.book as Book;
  const db = getFirestore(app);

  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const audioRef = useRef(new Audio());
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(book?.pdfUrl);
  const [txtCurrentChapter, setTxtCurrentChapter] = useState(0);
  const urlToCheck = book?.pdfUrl ?? pdfUrl ?? "";
  const isTxtFile = urlToCheck.includes("books%2Ftxt%2F") || urlToCheck.includes(".txt");
  const isEpubFile = urlToCheck.includes(".epub");
  const isPdfFile = urlToCheck.includes(".pdf");
  const startTimeRef = useRef<Date>(new Date());
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);

  useEffect(() => {
    if (book?.pdfUrl || isTxtFile || isEpubFile) return;
    const loadFromIndexedDB = async () => {
      const dbReq = window.indexedDB.open("MyBookStorage");
      dbReq.onsuccess = () => {
        const db = dbReq.result;
        const tx = db.transaction("pdfs", "readonly");
        const store = tx.objectStore("pdfs");
        const getReq = store.get(book.id);
        getReq.onsuccess = () => {
          const file = getReq.result?.file;
          if (file) {
            const url = URL.createObjectURL(file);
            setPdfUrl(url);
          }
        };
      };
    };
    loadFromIndexedDB();
  }, [book?.id, book?.pdfUrl, isTxtFile, isEpubFile]);

  // 마지막 읽은 위치 복원
  useEffect(() => {
    const restoreReadingPosition = async () => {
      if (!book?.id) return;
      
      const progress = await getReadingProgress(book.id);
      if (progress) {
        if (progress.currentPage && isPdfFile) {
          setPageNumber(progress.currentPage);
        } else if (progress.currentChapter !== undefined && (isTxtFile || isEpubFile)) {
          setTxtCurrentChapter(progress.currentChapter);
        }
      }
    };
    
    restoreReadingPosition();
  }, [book?.id, isTxtFile, isEpubFile, isPdfFile]);

  // 읽기 시간 추적
  useEffect(() => {
    const interval = setInterval(() => {
      if (book?.id) {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - startTimeRef.current.getTime()) / (1000 * 60));
        if (diffInMinutes > 0) {
          updateReadingTime(book.id, diffInMinutes);
          startTimeRef.current = now;
        }
      }
    }, 60000); // 1분마다 체크

    return () => clearInterval(interval);
  }, [book?.id]);

  // 페이지/챕터 변경 시 진행률 저장
  useEffect(() => {
    if (book?.id) {
      if (isTxtFile || isEpubFile) {
        saveReadingProgress(book.id, undefined, undefined, txtCurrentChapter, chapters.length);
      } else if (isPdfFile && numPages) {
        saveReadingProgress(book.id, pageNumber, numPages);
      }
    }
  }, [book?.id, pageNumber, numPages, txtCurrentChapter, chapters.length, isTxtFile, isEpubFile, isPdfFile]);

  // 사용자 음악 취향 로드
  useEffect(() => {
    const loadUserPreferences = async () => {
      const preferences = await getUserMusicPreferences();
      setUserPreferences(preferences);
    };
    loadUserPreferences();
  }, []);

  // 개인화된 음악 생성 함수
  const generatePersonalizedMusic = async (chapterIndex: number, chapterTitle: string) => {
    if (!book?.id || isGeneratingMusic) return null;

    setIsGeneratingMusic(true);
    try {
      const formData = new FormData();
      
      // PDF/TXT 파일 추가 (필요한 경우)
      if (pdfUrl) {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const file = new File([blob], `${book.name || book.id}.pdf`, { type: blob.type });
        formData.append("file", file);
      }
      
      formData.append("book_id", book.id);
      formData.append("page", String(chapterIndex + 1));
      formData.append("chapter_title", chapterTitle);
      formData.append("preference", JSON.stringify(userPreferences));

      const response = await fetch(`${BASE_AI_URL}/generate/music-v3`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`AI 서버 응답 오류: ${response.status}`);
      }

      const data = await response.json();
      return `${BASE_AI_URL}/gen_musics/${book.id}/ch${chapterIndex}.wav`;
    } catch (error) {
      console.error("개인화된 음악 생성 실패:", error);
      return null;
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  useEffect(() => {
    const fetchChapters = async () => {
      if (!book?.id) return;
      const docSnap = await getDoc(doc(db, "books", book.id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.chapters) {
          const converted = data.chapters.map((ch: any) => ({
            ...ch,
            page: Number(ch.page),
          }));
          setChapters(converted);
          
          // 첫 번째 챕터의 개인화된 음악 생성 및 재생
          if (converted[0] && userPreferences.length > 0) {
            generatePersonalizedMusic(0, converted[0].title).then((musicUrl) => {
              if (musicUrl) {
                audioRef.current.src = musicUrl;
                audioRef.current.play();
              }
            });
          } else if (converted[0]?.musicUrl) {
            // 기존 음악이 있는 경우 기본값으로 사용
            audioRef.current.src = converted[0].musicUrl;
            audioRef.current.play();
          }
        }
      }
    };
    
    // 사용자 취향이 로드된 후에 챕터 로드
    if (userPreferences.length >= 0) {
      fetchChapters();
    }
  }, [book?.id, userPreferences]);

  useEffect(() => {
    const matched = chapters
      .slice()
      .reverse()
      .find((ch) => ch.page <= pageNumber);
    
    if (matched) {
      const chapterIndex = chapters.findIndex(ch => ch === matched);
      
      // 사용자 취향이 있으면 개인화된 음악 생성, 없으면 기본 음악 사용
      if (userPreferences.length > 0) {
        generatePersonalizedMusic(chapterIndex, matched.title).then((musicUrl) => {
          if (musicUrl && musicUrl !== audioRef.current.src) {
            audioRef.current.src = musicUrl;
            if (isPlaying) audioRef.current.play();
          }
        });
      } else if (matched.musicUrl !== audioRef.current.src) {
        audioRef.current.src = matched.musicUrl;
        if (isPlaying) audioRef.current.play();
      }
    }
  }, [pageNumber, chapters, userPreferences]);

  const handleDocumentLoad = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const nextPage = () =>
    setPageNumber((prev) => Math.min(prev + 1, numPages ?? prev));
  const prevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));

  return (
    <Container>
      <Navbar />
      <Layout>
        <Hamburger onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "×" : "☰"}
        </Hamburger>

        {sidebarOpen && (
          <Sidebar>
            <Header>
              <div>
                <h2>{book.title}</h2>
                <p>{book.author}</p>
              </div>
            </Header>
            <h3>📚 목차</h3>
            <ul>
              {chapters.map((ch, idx) => {
                const defaultMusicUrl = (isTxtFile || isEpubFile)
                  ? `${BASE_AI_URL}/gen_musics/${book.name}/ch${idx}.wav`
                  : ch.musicUrl;

                return (
                  <li key={idx}>
                    <span
                      onClick={() => {
                        if (isTxtFile || isEpubFile) {
                          setTxtCurrentChapter(idx);
                        } else {
                          setPageNumber(Number(ch.page));
                        }
                      }}
                    >
                      {ch.title}
                    </span>
                    <div className="chapter-controls">
                      <button
                        onClick={async () => {
                          const audio = audioRef.current;
                          audio.pause();
                          
                          // 사용자 취향이 있으면 개인화된 음악 생성
                          if (userPreferences.length > 0) {
                            const personalizedUrl = await generatePersonalizedMusic(idx, ch.title);
                            if (personalizedUrl) {
                              audio.src = personalizedUrl;
                              audio.play();
                              setIsPlaying(true);
                            }
                          } else if (defaultMusicUrl) {
                            audio.src = defaultMusicUrl;
                            audio.play();
                            setIsPlaying(true);
                          }
                        }}
                        disabled={isGeneratingMusic}
                      >
                        {isGeneratingMusic 
                          ? "🎵" 
                          : (audioRef.current.src.includes(`ch${idx}`) && isPlaying ? "⏸" : "▶")
                        }
                      </button>
                      <a 
                        href={userPreferences.length > 0 
                          ? `${BASE_AI_URL}/gen_musics/${book.id}/ch${idx}.wav` 
                          : defaultMusicUrl
                        } 
                        download
                      >
                        ⬇
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
            <MusicControls>
              <button
                onClick={() => {
                  const audio = audioRef.current;
                  if (isPlaying) {
                    audio.pause();
                  } else {
                    audio.play();
                  }
                  setIsPlaying(!isPlaying);
                }}
              >
                {isPlaying ? "⏸️ 멈춤" : "▶️ 재생"}
              </button>
              <a href={audioRef.current.src} download>
                🎵 전체 음악 다운로드
              </a>
            </MusicControls>
          </Sidebar>
        )}

        <Main>
          <PdfContainer>
            {isTxtFile && pdfUrl ? (
              <TxtViewer
                key={book.id}
                txtUrl={pdfUrl}
                name={book.name}
                currentIndex={txtCurrentChapter}
                setCurrentIndex={setTxtCurrentChapter}
                externalAudioRef={audioRef}
                setIsPlaying={setIsPlaying}
              />
            ) : isEpubFile && pdfUrl ? (
              <EpubViewer
                key={book.id}
                epubUrl={pdfUrl}
                name={book.name}
                currentIndex={txtCurrentChapter}
                setCurrentIndex={setTxtCurrentChapter}
                externalAudioRef={audioRef}
                setIsPlaying={setIsPlaying}
              />
            ) : isPdfFile && pdfUrl ? (
              <Document file={pdfUrl} onLoadSuccess={handleDocumentLoad}>
                <Page
                  key={pageNumber}
                  pageNumber={pageNumber}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            ) : (
              <p>문서를 불러올 수 없습니다.</p>
            )}
          </PdfContainer>

          {isPdfFile && (
            <NavButtons>
              <button onClick={prevPage} disabled={pageNumber === 1}>
                ← 이전
              </button>
              <span>
                {pageNumber} / {numPages ?? "?"}
              </span>
              <button onClick={nextPage} disabled={pageNumber === numPages}>
                다음 →
              </button>
            </NavButtons>
          )}
        </Main>
      </Layout>
      <Footer />
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 960px;
  user-select: none;
`;

const Layout = styled.div`
  display: flex;
  position: relative;
`;

const Hamburger = styled.button`
  position: absolute;
  top: 5.3rem;
  left: 3rem;
  z-index: 1000;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
`;

const Sidebar = styled.aside`
  position: absolute;
  top: 4rem;
  left: 2rem;
  width: 280px;
  height: 82%;
  background: #f5f5f5;
  border-right: 1px solid #ccc;
  padding: 1rem;
  z-index: 999;
  overflow-y: auto;

  ul {
    list-style: none;
    padding: 0;
    margin-top: 2rem;

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;

      span {
        cursor: pointer;
        color: #5f3dc4;
        font-weight: 500;
      }

      .chapter-controls {
        display: flex;
        gap: 0.4rem;

        button,
        a {
          background: #ddd;
          border: none;
          padding: 0.3rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
        }
      }
    }
  }
`;

const MusicControls = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  button {
    background: #5f3dc4;
    color: white;
    border: none;
    padding: 0.4rem 1rem;
    border-radius: 6px;
    cursor: pointer;
  }

  a {
    text-decoration: none;
    color: #5f3dc4;
    font-weight: bold;
    text-align: center;
  }
`;

const Main = styled.main`
  width: 100%;
  max-width: 960px;
  padding: 1.5rem 1.5rem 2rem; // 상하 여백 조절
  box-sizing: border-box;
`;

const Header = styled.div`
  margin-top: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PdfContainer = styled.div`
  margin-top: 2rem;
  border: 1px solid #ccc;
`;

const NavButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;
