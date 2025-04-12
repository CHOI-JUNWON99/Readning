import styled from "styled-components";

export default function IntroSection() {
  return (
    <Section>
      <Left>
        <Title>오디오에 대한 모든 것</Title>
        <Highlight>몇 분 안에 멋진 음악과 음향 효과를 만듭니다</Highlight>
        <Description>
          리드닝 AI가 당신의 독서를 더 몰입감 있게 만들어줍니다.
          <br />
          자동으로 감성 음악이 흐르는 새로운 독서 경험을 만나보세요.
        </Description>
        <StartButton>지금 시작하기</StartButton>
      </Left>
      <Right>
        <MockCard>
          <p>
            <strong>AI Mood Music</strong>
          </p>
          <small>책 분위기에 맞춰 자동 재생 중...</small>
        </MockCard>
      </Right>
    </Section>
  );
}

const Section = styled.section`
  width: 100%;
  max-width: 800px;
  margin: 4rem auto;
  padding: 3rem 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  background: #fefefe;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  gap: 2rem;
`;

const Left = styled.div`
  flex: 1;
  min-width: 280px;
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 0.6rem;
`;

const Highlight = styled.p`
  font-size: 1.3rem;
  color: #5f3dc4;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: #444;
  line-height: 1.6;
  font-size: 0.965rem;
  margin-bottom: 1.5rem;
`;

const StartButton = styled.button`
  background-color: #5f3dc4;
  color: white;
  padding: 0.8rem 1.8rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #4e2fa4;
  }
`;

const MockCard = styled.div`
  width: 250px;
  height: 140px;
  background-color: #f3f0ff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 0 0 2px #ddd;
  padding: 1rem;
  text-align: center;

  p {
    font-size: 1.1rem;
    font-weight: bold;
    color: #3f3f3f;
    margin-bottom: 0.5rem;
  }

  small {
    font-size: 0.9rem;
    color: #777;
  }
`;
