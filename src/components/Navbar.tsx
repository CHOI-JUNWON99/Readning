import styled from "styled-components";

export default function Navbar() {
  return (
    <NavBarContainer>
      <Logo>📚 Readning</Logo>
    </NavBarContainer>
  );
}

// ================= styled-components =================

const NavBarContainer = styled.nav`
  width: 100%;
  padding: 1rem 2rem;
  background-color: #d7c4a3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 1.8rem;
  font-family: "Georgia", serif;
  color: #3e2c1c;
`;
