import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface Props {
  firstName: string;
}

export default function WelcomeEmail({ firstName = 'Victor' }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Welcome aboard, {firstName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Hr style={hr} />
            <Text style={paragraph}>Welcome to Bloomers, {firstName}</Text>
            <Text style={paragraph}>All that you need to be great</Text>
            <Text style={paragraph}>— The Bloomers team</Text>
            <Hr style={hr} />
            <Text style={footer}>Making moms happy</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const paragraph = {
  color: '#525f7f',

  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const _anchor = {
  color: '#556cd6',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};
