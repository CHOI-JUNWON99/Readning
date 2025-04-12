import styled from "styled-components";
import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { app } from "../firebase/firebase"; // ⚠️ 너의 firebase 초기화 위치에 맞게 수정해줘
import { useNavigate } from "react-router-dom";

const db = getFirestore(app);

export default function BookshelfSection() {
  const [recBooks, setRecBooks] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      const querySnapshot = await getDocs(collection(db, "books"));
      const books = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((book) => book.isAI === false); // "리드닝 제공 책" 필터 조건
      setRecBooks(books);
    };
    fetchBooks();
  }, []);

  const myBooks = Array.from({ length: 7 }, (_, i) => ({
    id: `my-${i}`,
    title: `개인 책 ${i + 1}`,
    author: "사용자 업로드",
  }));

  const handleBookClick = (book: any) => {
    navigate(`/read/${book.id}`, { state: { book } });
  };

  return (
    <Wrapper>
      <SectionTitle>📁 사용자가 추가한 책 목록</SectionTitle>
      <SliderContainer>
        {myBooks.map((book) => (
          <BookCard key={book.id}>
            <BookCover />
            <BookInfo>
              <strong>{book.title}</strong>
              <small>{book.author}</small>
            </BookInfo>
          </BookCard>
        ))}
      </SliderContainer>

      <SectionTitle>📘 리드닝이 제공하는 책 목록</SectionTitle>
      <GridContainer>
        {recBooks.map((book) => (
          <BookCard key={book.id} onClick={() => handleBookClick(book)}>
            <BookCover style={{ backgroundImage: `url(${book.coverUrl})` }} />
            <BookInfo>
              <strong>{book.title}</strong>
              <small>{book.author}</small>
            </BookInfo>
          </BookCard>
        ))}
      </GridContainer>
    </Wrapper>
  );
}

const Wrapper = styled.section`
  max-width: 860px;
  margin: 2rem auto;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: #3e2c1c;
  margin: 1.5rem 1rem 1rem;
  font-family: "Georgia", serif;
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
    background-color: #cdb89e;
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

const BookCover = styled.div`
  width: 100%;
  height: 140px;
  background-size: cover;
  background-position: center;
  border-radius: 6px;
  margin-bottom: 0.5rem;
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
