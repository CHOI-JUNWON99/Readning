import styled from "styled-components";
import { Link } from "react-router-dom";
import { handleGoogleLogin } from "./handleGoogleLogin";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    const photo = localStorage.getItem("user_photo");
    if (name) setUserName(name);
    if (photo) setUserPhoto(photo);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_uid");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_photo");
    localStorage.removeItem("user_email");
    window.location.reload();
  };

  return (
    <Nav>
      <Logo>
        <Link to="/">🎵 리드닝</Link>
      </Logo>
      <NavLinks>
        <a href="#about">서비스 소개</a>
        <a href="#faq">FAQ</a>
        <a href="#pricing">가격</a>

        {userName ? (
          <DropdownContainer>
            <UserInfo onClick={() => setDropdownOpen((prev) => !prev)}>
              {userPhoto && <ProfileImg src={userPhoto} alt="프로필" />}
              <UserName>{userName}</UserName>
            </UserInfo>
            {dropdownOpen && (
              <DropdownMenu>
                <DropdownItem onClick={handleLogout}>로그아웃</DropdownItem>
              </DropdownMenu>
            )}
          </DropdownContainer>
        ) : (
          <LoginButton type="button" onClick={handleGoogleLogin}>
            Google 로그인
          </LoginButton>
        )}
      </NavLinks>
    </Nav>
  );
}

const UserName = styled.span`
  font-weight: 500;
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 120%;
  right: 0;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const DropdownItem = styled.div`
  padding: 0.7rem 1.2rem;
  cursor: pointer;
  font-size: 0.95rem;
  white-space: nowrap;

  &:hover {
    background-color: #f2f2f2;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 500;
  color: #3a3a3a;
  cursor: pointer;
  &:hover {
    color: #5f3dc4;
  }
`;

const ProfileImg = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

const Nav = styled.nav`
  width: 100%;
  padding: 1.2rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9fb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  margin-top: -2rem; //navbar 상단고정
`;

const Logo = styled.h1`
  font-size: 1.6rem;
  font-weight: bold;
  font-family: "Georgia", serif;
  color: #4d3b2a;
  a {
    color: #3a3a3a;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      color: #5f3dc4;
    }
  }
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
