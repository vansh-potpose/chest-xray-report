"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, Loader, Download, Printer } from "lucide-react";

// Mock API call to simulate report generation
const generateReport = async (image) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        findings: [
          {
            condition: "Pneumonia",
            confidence: 0.92,
            description: "Bilateral infiltrates consistent with pneumonia",
            severity: "Moderate",
          },
          {
            condition: "Cardiomegaly",
            confidence: 0.85,
            description: "Mild cardiac enlargement observed",
            severity: "Mild",
          },
        ],
        recommendations: [
          "Follow-up chest X-ray recommended in 2 weeks",
          "Consider additional cardiac evaluation",
        ],
        timestamp: new Date().toISOString(),
      });
    }, 3000);
  });
};

export default function Generator() {
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState(null);
  const [scanPosition, setScanPosition] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setIsProcessing(true);
      setReport(null);

      // Animate scanning effect
      const scanAnimation = () => {
        setScanPosition((prev) => {
          if (prev >= 100) return 0;
          return prev + 1;
        });
      };
      const scanInterval = setInterval(scanAnimation, 20);

      // Generate report
      const result = await generateReport(file);
      clearInterval(scanInterval);
      setScanPosition(0);
      setIsProcessing(false);
      setReport(result);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    multiple: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            X-Ray Report Generator
          </h1>
          <p className="text-lg text-gray-600">
            Upload a chest X-ray image to generate an AI-powered diagnostic report
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg text-gray-600">
              {isDragActive
                ? "Drop the X-ray image here"
                : "Drag and drop an X-ray image, or click to select"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: JPEG, PNG
            </p>
          </div>

          {image && (
            <div className="mt-8 relative">
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt="Uploaded X-ray"
                  className="w-full h-auto"
                />
                {isProcessing && (
                  <motion.div
                    className="absolute left-0 w-full h-1 bg-green-500 opacity-50"
                    style={{ top: `${scanPosition}%` }}
                    animate={{
                      top: ["0%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="mt-8 text-center">
              <Loader className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Analyzing X-ray image...</p>
            </div>
          )}

          {report && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 border rounded-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Diagnostic Report
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Findings
                  </h3>
                  {report.findings.map((finding, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 mb-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {finding.condition}
                          </h4>
                          <p className="text-gray-600 mt-1">
                            {finding.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {Math.round(finding.confidence * 100)}% confidence
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            Severity: {finding.severity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Recommendations
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {report.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
