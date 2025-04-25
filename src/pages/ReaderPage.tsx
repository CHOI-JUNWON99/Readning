import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import styled from "styled-components";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { app } from "../firebase/firebase";
import TxtViewer from "./TxtViewer";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

  const urlToCheck = book?.pdfUrl ?? pdfUrl ?? "";
  const isTxtFile = urlToCheck.includes("books%2Ftxt%2F");

  useEffect(() => {
    if (book?.pdfUrl || isTxtFile) return;
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
  }, [book?.id, book?.pdfUrl, isTxtFile]);

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
          if (converted[0]?.musicUrl) {
            audioRef.current.src = converted[0].musicUrl;
            audioRef.current.play();
          }
        }
      }
    };
    fetchChapters();
  }, [book?.id]);

  useEffect(() => {
    const matched = chapters
      .slice()
      .reverse()
      .find((ch) => ch.page <= pageNumber);
    if (matched && matched.musicUrl !== audioRef.current.src) {
      audioRef.current.src = matched.musicUrl;
      if (isPlaying) audioRef.current.play();
    }
  }, [pageNumber, chapters]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

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
              {chapters.map((ch, idx) => (
                <li key={idx}>
                  <span onClick={() => setPageNumber(Number(ch.page))}>
                    {ch.title}
                  </span>
                  <div className="chapter-controls">
                    <button
                      onClick={() => {
                        audioRef.current.src = ch.musicUrl;
                        audioRef.current.play();
                        setIsPlaying(true);
                      }}
                    >
                      ▶
                    </button>
                    <a href={ch.musicUrl} download>
                      ⬇
                    </a>
                  </div>
                </li>
              ))}
            </ul>
            <MusicControls>
              <button onClick={togglePlay}>
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
              <TxtViewer txtUrl={pdfUrl} name={book.name} />
            ) : pdfUrl?.includes(".pdf") ? (
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

          {!isTxtFile && (
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
