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

const FooterContainer = styled.footer`
  width: 100%;
  background-color: #f8f9fa;
  border-top: 1px solid #e1e1e1;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Inner = styled.div`
  width: 100%;
  max-width: 800px;
  text-align: center;
  font-size: 0.85rem;
  color: #6c757d;
  font-family: "Georgia", serif;
`;
