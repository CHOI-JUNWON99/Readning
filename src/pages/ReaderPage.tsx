import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import styled from "styled-components";

// PDF Worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function ReaderPage() {
  const { state } = useLocation();
  const book = state?.book;

  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [audio] = useState(new Audio("https://example.com/ai-music.mp3")); // 추후 API 결과로 대체 가능

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
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
      <Header>
        <div>
          <h2>{book.title}</h2>
          <p>{book.author}</p>
        </div>
        <MusicControls>
          <button onClick={togglePlay}>
            {isPlaying ? "⏸️ 멈춤" : "▶️ 재생"}
          </button>
          <a href="https://example.com/ai-music.mp3" download>
            🎵 다운로드
          </a>
        </MusicControls>
      </Header>

      <PdfContainer>
        <Document file={book.pdfUrl} onLoadSuccess={handleDocumentLoad}>
          <Page pageNumber={pageNumber} />
        </Document>
      </PdfContainer>

      <NavButtons>
        <button onClick={prevPage} disabled={pageNumber === 1}>
          ← 이전
        </button>
        <span>
          {pageNumber} / {numPages}
        </span>
        <button onClick={nextPage} disabled={pageNumber === numPages}>
          다음 →
        </button>
      </NavButtons>
    </Container>
  );
}

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
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

const MusicControls = styled.div`
  display: flex;
  gap: 1rem;

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
  }
`;
