import styled from "styled-components";

export default function Footer() {
  return (
    <FooterContainer>
      <Inner>
        <p>© 2025 Readning. All rights reserved.</p>
      </Inner>
    </FooterContainer>
  );
}

// ================= styled-components =================

const FooterContainer = styled.footer`
  width: 100%;
  background-color: #d7c4a3;
  border-top: 1px solid #b8a078;
  padding: 1rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Inner = styled.div`
  width: 100%;
  max-width: 800px;
  text-align: center;
  color: #3e2c1c;
  font-size: 0.9rem;
  font-family: "Georgia", serif;
`;
