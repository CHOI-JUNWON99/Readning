import styled from "styled-components";
import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { app } from "@/utils/firebase";
import { useNavigate } from "react-router-dom";
import { getAllReadingProgress, getProgressColor } from "@/utils/readingProgress";
import MusicPreferenceModal from "./MusicPreferenceModal";

type Book = {
  id: string;
  title: string;
  author: string;
  name?: string;
  pdfUrl?: string;
  pdfBlobKey?: string;
  coverUrl?: string;
  isAI?: boolean;
  createdAt?: any;
  chapters?: {
    page: number;
    title: string;
    musicUrl: string;
  }[];
};

const db = getFirestore(app);

export default function BookshelfSection() {
  const [recBooks, setRecBooks] = useState<Book[]>([]);
  const [userBooks, setUserBooks] = useState<Book[]>([]);
  const [readingProgress, setReadingProgress] = useState<any>({});
  const [showMusicModal, setShowMusicModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      const querySnapshot = await getDocs(collection(db, "books"));
      const books = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Book))
        .filter((book) => book.isAI === false);
      setRecBooks(books);
    };

    const fetchUserBooks = async () => {
      const uid = localStorage.getItem("user_uid"); // 로그인된 사용자 UID 확인
      if (!uid) return;

      try {
        const snapshot = await getDocs(collection(db, "users", uid, "books")); // Firestore에서 해당 유저 경로의 books 컬렉션 불러옴
        const userUploadedBooks = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Book)
        );
        setUserBooks(userUploadedBooks);
      } catch (e) {
        console.error("유저 책 불러오기 실패:", e);
      }
    };

    const fetchProgress = async () => {
      const progress = await getAllReadingProgress();
      setReadingProgress(progress);
    };

    fetchBooks();
    fetchUserBooks();
    fetchProgress();
  }, []);

  const handleBookClick = (book: Book) => {
    navigate(`/read/${book.id}`, { state: { book } });
  };

  return (
    <Wrapper>
      <Header>
        <SectionTitle>📁 사용자가 추가한 책 목록</SectionTitle>
        <MusicButton onClick={() => setShowMusicModal(true)}>
          🎵 음악 취향 설정
        </MusicButton>
      </Header>
      
      <SliderContainer>
        {userBooks.map((book) => {
          const progress = readingProgress[book.id];
          return (
            <BookCard key={book.id} onClick={() => handleBookClick(book)}>
              <BookCoverContainer>
                <BookCover
                  style={{ backgroundImage: `url(${book.coverUrl || ""})` }}
                />
                {progress && (
                  <ProgressOverlay>
                    <ProgressBar 
                      percentage={progress.progressPercentage}
                      color={getProgressColor(progress.progressPercentage)}
                    />
                    <ProgressText>
                      {progress.progressPercentage}%
                    </ProgressText>
                  </ProgressOverlay>
                )}
              </BookCoverContainer>
              <BookInfo>
                <strong>{book.title}</strong>
                <small>{book.author}</small>
                {progress && (
                  <ProgressInfo>
                    {progress.progressPercentage}% 완료
                  </ProgressInfo>
                )}
              </BookInfo>
            </BookCard>
          );
        })}
        {userBooks.length === 0 && (
          <p>로그인 후 추가한 책이 여기에 표시됩니다.</p>
        )}
      </SliderContainer>

      <SectionTitle>📘 리드닝이 제공하는 책 목록</SectionTitle>
      <GridContainer>
        {recBooks.map((book) => {
          const progress = readingProgress[book.id];
          return (
            <BookCard key={book.id} onClick={() => handleBookClick(book)}>
              <BookCoverContainer>
                <BookCover style={{ backgroundImage: `url(${book.coverUrl})` }} />
                {progress && (
                  <ProgressOverlay>
                    <ProgressBar 
                      percentage={progress.progressPercentage}
                      color={getProgressColor(progress.progressPercentage)}
                    />
                    <ProgressText>
                      {progress.progressPercentage}%
                    </ProgressText>
                  </ProgressOverlay>
                )}
              </BookCoverContainer>
              <BookInfo>
                <strong>{book.title}</strong>
                <small>{book.author}</small>
                {progress && (
                  <ProgressInfo>
                    {progress.progressPercentage}% 완료
                  </ProgressInfo>
                )}
              </BookInfo>
            </BookCard>
          );
        })}
      </GridContainer>
      
      <MusicPreferenceModal
        isOpen={showMusicModal}
        onClose={() => setShowMusicModal(false)}
        onSave={(preferences) => {
          console.log("음악 취향 저장됨:", preferences);
        }}
      />
    </Wrapper>
  );
}

const Wrapper = styled.section`
  max-width: 860px;
  margin: 2rem auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.5rem 1rem 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: #3e2c1c;
  margin: 0;
  font-family: "Georgia", serif;
`;

const MusicButton = styled.button`
  background: #5f3dc4;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #4c2db3;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding: 1rem;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #92908e;
    border-radius: 10px;
  }
`;

const BookCard = styled.div`
  min-width: 130px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  padding: 0.6rem;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const BookCoverContainer = styled.div`
  position: relative;
  width: 100%;
  height: 140px;
  margin-bottom: 0.5rem;
`;

const BookCover = styled.div`
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 6px;
`;

const ProgressOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  border-radius: 0 0 6px 6px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProgressBar = styled.div<{ percentage: number; color: string }>`
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.percentage}%;
    height: 100%;
    background: ${props => props.color};
    border-radius: 2px;
    transition: width 0.3s ease;
  }
`;

const ProgressText = styled.span`
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  min-width: 25px;
`;

const BookInfo = styled.div`
  strong {
    display: block;
    font-size: 0.95rem;
    color: #3e2c1c;
  }
  small {
    font-size: 0.8rem;
    color: #777;
  }
`;

const ProgressInfo = styled.div`
  font-size: 0.75rem;
  color: #5f3dc4;
  font-weight: bold;
  margin-top: 0.2rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  padding: 1rem;
  max-height: 500px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #cdb89e;
    border-radius: 10px;
  }

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
