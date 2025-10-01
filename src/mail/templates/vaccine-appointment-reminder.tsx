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

export interface Props {
  firstName: string;
  childName: string;
  vaccinationDate: string;
  vaccine: string;
  humanVaccinationDate: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
}

export default function VaccinationAppointmentReminderEmail({
  firstName,
  childName,
  vaccinationDate,
  vaccine,
  humanVaccinationDate,
  parentName,
  parentPhone,
  parentEmail,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>A child in your hospital has an upcoming vaccination.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Hr style={hr} />
            <Text style={paragraph}>Hi {firstName}, </Text>
            <Text style={paragraph}>
              {childName} has an upcoming vaccination with the following details
            </Text>
            <Text style={paragraph}>
              Vaccination Date: {vaccinationDate} ({humanVaccinationDate})
            </Text>
            <Text style={paragraph}>Vaccine: {vaccine}</Text>
            <Text style={paragraph}>Parent Name: {parentName}</Text>
            <Text style={paragraph}>Parent Phone Number: {parentPhone}</Text>
            {parentEmail ? (
              <Text style={paragraph}>Parent Email: {parentEmail}</Text>
            ) : null}
            <Hr style={hr} />
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
