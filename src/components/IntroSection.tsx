import styled from "styled-components";

export default function IntroSection() {
  return (
    <Section>
      <Heading>리드닝</Heading>
      <Paragraph>
        당신의 독서에 어울리는 음악을 자동으로 재생해주는 새로운 독서 경험을
        만나보세요.
      </Paragraph>
    </Section>
  );
}

// ================= styled-components =================

const Section = styled.section`
  width: 100%;
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: #f9f6f1;
  text-align: center;
  color: #4d3b2a;
  border-radius: 10px;
`;

const Heading = styled.h2`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-family: "Georgia", serif;
`;

const Paragraph = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
`;
