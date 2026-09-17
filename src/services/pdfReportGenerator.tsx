import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica"
  },
  header: {
    fontSize: 22,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#4f46e5"
  },
  subheader: {
    fontSize: 12,
    marginBottom: 20,
    color: "#6b7280"
  },
  section: {
    marginBottom: 15
  },
  title: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#111827"
  },
  body: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#374151"
  }
});

interface PdfDocumentProps {
  title: string;
  subtitle?: string;
  content: string;
  date?: string;
}

export const PdfDocumentReport: React.FC<PdfDocumentProps> = ({
  title,
  subtitle,
  content,
  date = new Date().toLocaleDateString()
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{title}</Text>
      {subtitle && <Text style={styles.subheader}>{subtitle} • Generated {date}</Text>}
      <View style={styles.section}>
        <Text style={styles.body}>{content}</Text>
      </View>
    </Page>
  </Document>
);

export async function generatePdfBlob(title: string, subtitle: string, content: string): Promise<Blob> {
  const doc = <PdfDocumentReport title={title} subtitle={subtitle} content={content} />;
  const instance = pdf(doc);
  return await instance.toBlob();
}
