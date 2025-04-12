import styled from "styled-components";

export default function Navbar() {
  return (
    <Nav>
      <Logo>🎵 리드닝</Logo>
      <NavLinks>
        <a href="#about">서비스 소개</a>
        <a href="#faq">FAQ</a>
        <a href="#pricing">가격</a>
        <LoginButton>로그인</LoginButton>
      </NavLinks>
    </Nav>
  );
}

const Nav = styled.nav`
  width: 100%;
  padding: 1.2rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9fb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
`;

const Logo = styled.h1`
  font-size: 1.6rem;
  font-weight: bold;
  font-family: "Georgia", serif;
  color: #4d3b2a;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;

  a {
    color: #3a3a3a;
    text-decoration: none;
    font-weight: 500;
    font-size: 1rem;

    &:hover {
      color: #5f3dc4;
    }
  }
`;

const LoginButton = styled.button`
  background-color: #5f3dc4;
  color: white;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4a2faf;
  }
`;
