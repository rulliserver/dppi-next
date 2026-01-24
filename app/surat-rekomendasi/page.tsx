// components/PDFClient.js
"use client";

import React from "react";
import dynamic from "next/dynamic";
import SuratRekomendasi from "../components/SuratRekomendasi";


// Dynamically import PDFDownloadLink with ssr: false
const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    {
        ssr: false, // This is crucial for Next.js
        loading: () => <p>Loading document...</p>,
    }
);

const PDFClient = () => (
    <div>
        <PDFDownloadLink document={<SuratRekomendasi />} fileName="somename.pdf">
            {({ blob, url, loading, error }) =>
                loading ? 'Loading document...' : 'Download PDF'
            }
        </PDFDownloadLink>
    </div>
);

export default PDFClient;
