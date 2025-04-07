import styled from "styled-components";

const dummyBooks = Array.from({ length: 15 }, (_, i) => ({
  id: `dummy-${i}`,
  title: `샘플 책 ${i + 1}`,
  author: "작가 미상",
}));

export default function BookshelfSection() {
  return (
    <Section>
      <Title>📖 책장</Title>
      <SearchInput type="text" placeholder="도서를 검색하세요..." />
      <Grid>
        {dummyBooks.map((book) => (
          <BookCard key={book.id}>
            <Cover />
            <Info>
              <div className="title">{book.title}</div>
              <div className="author">{book.author}</div>
            </Info>
          </BookCard>
        ))}
      </Grid>
    </Section>
  );
}

// ================= styled-components =================

const Section = styled.section`
  padding: 2rem;
  background-color: #f2ede4;
  width: 100%;

  margin: 0 auto;
  text-align: center;
`;

const Title = styled.h3`
  font-size: 1.5rem;
  color: #3e2c1c;
  margin-bottom: 1rem;
  font-family: "Georgia", serif;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid #bca37d;
  border-radius: 4px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.5rem;
  background: repeating-linear-gradient(
    to bottom,
    #e8dbc5 0px,
    #e8dbc5 180px,
    #d6c2a1 180px,
    #d6c2a1 190px
  );
  padding: 1rem;
  border-radius: 10px;
`;

const BookCard = styled.div`
  height: 150px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  text-align: center;
  padding: 0.4rem;
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
  }
`;

const Cover = styled.div`
  width: 100%;
  height: 100px;
  background-image: url("https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?fit=crop&w=200&q=80");
  background-size: cover;
  background-position: center;
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const Info = styled.div`
  .title {
    font-weight: bold;
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
    color: #3e2c1c;
  }
  .author {
    font-size: 0.85rem;
    color: #666;
  }
`;
