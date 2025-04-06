"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, Download, Printer, AlertCircle, FileX } from "lucide-react";

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
            regions: ["Lower right lobe", "Lower left lobe"],
          },
          {
            condition: "Cardiomegaly",
            confidence: 0.85,
            description: "Mild cardiac enlargement observed",
            severity: "Mild",
            regions: ["Heart silhouette"],
          },
        ],
        recommendations: [
          "Follow-up chest X-ray recommended in 2 weeks",
          "Consider additional cardiac evaluation",
          "Monitor for worsening respiratory symptoms",
        ],
        timestamp: new Date().toISOString(),
      });
    }, 3000);
  });
};

function SeverityBadge({ severity }) {
  const colors = {
    Mild: "bg-green-100 text-green-800",
    Moderate: "bg-yellow-100 text-yellow-800",
    Severe: "bg-red-100 text-red-800",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[severity]}`}>
      {severity}
    </span>
  );
}

export default function App() {
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setError(null);
      setImage(URL.createObjectURL(file));
      setIsProcessing(true);
      setReport(null);

      try {
        const result = await generateReport(file);
        setReport(result);
      } catch (err) {
        setError("Failed to analyze the image. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  const handleReset = () => {
    setImage(null);
    setError(null);
    setReport(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI X-Ray Analysis</h1>
          <p className="text-lg text-gray-600">
            Upload a chest X-ray image for instant AI-powered diagnostic insights
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
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
              Supported formats: JPEG, PNG (max 10MB)
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-4 bg-red-50 rounded-lg flex items-start"
              >
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-700 hover:text-red-900"
                >
                  <FileX className="h-5 w-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {image && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
              <div className="relative rounded-lg overflow-hidden bg-black">
                <img
                  src={image}
                  alt="Uploaded X-ray"
                  className="w-full h-auto max-h-[600px] object-contain"
                />
                {isProcessing && (
                  <>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute left-0 w-full h-1 bg-blue-500"
                      initial={{ top: 0, opacity: 0.6 }}
                      animate={{ top: ["0%", "100%"], opacity: [0.6, 0.8, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent" />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/70 rounded-xl p-6 backdrop-blur-sm">
                        <Loader2 className="animate-spin h-10 w-10 text-blue-400 mx-auto mb-4" />
                        <p className="text-blue-200 text-lg font-medium">Scanning X-ray...</p>
                        <p className="text-blue-300/80 text-sm mt-2">Analyzing image patterns</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {report && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 border rounded-xl p-6 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Diagnostic Report</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(report.timestamp).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Findings</h3>
                    <div className="space-y-4">
                      {report.findings.map((finding, index) => (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          key={index}
                          className="bg-white rounded-lg p-4 shadow-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">
                                  {finding.condition}
                                </h4>
                                <SeverityBadge severity={finding.severity} />
                              </div>
                              <p className="text-gray-600">{finding.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {finding.regions.map((region, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    {region}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {Math.round(finding.confidence * 100)}% confidence
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {report.recommendations.map((rec, index) => (
                        <motion.li
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          key={index}
                          className="flex items-start"
                        >
                          <span className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-blue-500 mr-3" />
                          <span className="text-gray-600">{rec}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t">
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Analyze Another Image
                    </button>
                    <div className="flex space-x-4">
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <Printer className="h-4 w-4 mr-2" />
                        Print Report
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
