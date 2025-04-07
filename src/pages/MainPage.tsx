// src/pages/MainPage.tsx
import styled from "styled-components";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import IntroSection from "../components/IntroSection";
import UploadSection from "../components/UploadSection";
import BookshelfSection from "../components/BookshelfSection";

export default function MainPage() {
  return (
    <PageLayout>
      <Navbar />
      <IntroSection />
      <UploadSection />
      <BookshelfSection />
      <Footer />
    </PageLayout>
  );
}

const PageLayout = styled.div`
  width: 800px;
  display: flex;
  flex-direction: column;
`;
