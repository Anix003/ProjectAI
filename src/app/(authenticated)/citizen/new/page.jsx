"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { databases } from "@/lib/appwrite-client";
import { ID } from "appwrite";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Brain,
  MapPin,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Navigation,
  Sun,
  Moon,
} from "lucide-react";
import axios from "axios";

// Dynamic import for leaflet picker (SSR safe)
const LocationPicker = dynamic(() => import("./LocationPickerWrapper"), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] w-full bg-slate-900 flex items-center justify-center text-xs text-gray-500 font-bold border border-white/5 rounded-xl">
      Loading Map coordinates selector...
    </div>
  ),
});

export default function NewComplaintPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState("");

  // Coordinate coordinates (default centered near Kolkata / Bankura region in WB)
  const [latitude, setLatitude] = useState(23.2325);
  const [longitude, setLongitude] = useState(87.0789);
  const [address, setAddress] = useState(
    "Main Road, Bankura, West Bengal - 722101",
  );

  const [isDetecting, setIsDetecting] = useState(false);

  // AI Pipeline States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedLoc = localStorage.getItem("complaint_location");
    if (savedLoc) {
      try {
        const { lat, lng, addr } = JSON.parse(savedLoc);
        if (lat && lng) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLatitude(lat);
          setLongitude(lng);
        }
        if (addr) {
          setAddress(addr);
        }
      } catch (err) {
        console.error("Error parsing saved location:", err);
      }
    }
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        // Fetch address from OSM Nominatim reverse geocoding API
        let resolvedAddress = `Municipal Road, Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}, India`;
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            {
              headers: {
                "Accept-Language": "en",
              },
            }
          );
          if (res.data && res.data.display_name) {
            resolvedAddress = res.data.display_name;
          }
        } catch (err) {
          console.error("Reverse geocoding failed, using fallback:", err);
        }

        setAddress(resolvedAddress);

        // Save to local storage
        localStorage.setItem(
          "complaint_location",
          JSON.stringify({ lat, lng, addr: resolvedAddress })
        );
        setIsDetecting(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMsg = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location permission denied by browser. Please enable location access in browser settings.";
        }
        alert(errorMsg);
        setIsDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  // File to base64 converter
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Triggers API review
  const handleAIAnalyze = async () => {
    if (!title || !description) {
      alert("Please fill in Title and Description first.");
      return;
    }
    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const response = await axios.post("/api/ai/analyze", {
        title,
        description,
        imageBase64: imageBase64 || null,
        mimeType: imageFile ? imageFile.type : null,
      });

      setAiResult(response.data);
    } catch (err) {
      console.error("AI analyze failed:", err.message);
      alert(
        "AI Server analysis failed. You can still submit the complaint directly.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Please fill in required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Determine departments matching the prediction
      let targetDeptId = "DEP001"; // Default: Water Supply
      const category = aiResult?.ai_category || "Other";

      if (category === "Road Maintenance") targetDeptId = "DEP002";
      else if (category === "Sanitation") targetDeptId = "DEP003";
      else if (category === "Electricity") targetDeptId = "DEP004";
      else if (category === "Drainage") targetDeptId = "DEP005";

      // 2. Upload image to bucket (if present, Appwrite Storage can be used,
      // or we simulate by saving file IDs or storing the base64 URL directly in imageUrls)
      let fileIds = "[]";
      let fileUrls = "[]";

      if (imageFile) {
        // Simulating upload details
        const mockFileId = `file_${Math.random().toString(36).substring(2, 10)}`;
        fileIds = JSON.stringify([mockFileId]);
        fileUrls = JSON.stringify([
          imageBase64.slice(0, 1000) ||
            `https://storage.appwrite.io/files/${mockFileId}`,
        ]);
      }

      const complaintId = `CMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // 3. Save Complaint
      await databases.createDocument(databaseId, "complaints", ID.unique(), {
        id_complaint: complaintId,
        complaint_title: title,
        original_text: description,
        imageFileIds: fileIds,
        imageUrls: fileUrls,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address,
        ai_summary:
          aiResult?.ai_summary || `Citizen reported civic issues: ${title}.`,
        ai_category: category,
        priority: aiResult?.priority || "Medium",
        is_duplicate: aiResult?.is_duplicate || false,
        duplicate_of: aiResult?.duplicate_of || "",
        is_spam: aiResult?.is_spam || false,
        status: aiResult?.is_spam ? "Rejected" : "Submitted",
        tableUsers: user.$id,
        tableDepartments: targetDeptId,
        tableAdmin: "", // Unassigned
      });

      // 4. Create Audit Log
      await databases.createDocument(databaseId, "audit", ID.unique(), {
        id_audit: `AUD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        id_complaint: complaintId,
        action: "Complaint Filed",
        module: "Complaint",
        target_id: complaintId,
        description: `Citizen ${user.name} filed a new complaint.`,
      });

      alert("Grievance registered successfully.");
      router.push("/dashboard");
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Fields */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-6 space-y-6">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="text-blue-500 w-5 h-5" />
                Register New Grievance
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Our AI will automatically categorize, summarize, and route your
                file.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 font-bold block">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken water pipe leaking near clinic"
                  className="w-full bg-slate-950 border border-white/5 rounded-xl p-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-bold block">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about the issue, location identifiers, and severity..."
                  className="w-full bg-slate-950 border border-white/5 rounded-xl p-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  rows="5"
                  required
                />
              </div>

              {/* File Attachment */}
              <div className="space-y-1">
                <label className="text-gray-400 font-bold block">
                  Attach Photo (Optional)
                </label>
                <div className="border-2 border-dashed border-white/5 hover:border-blue-500/30 rounded-xl p-6 text-center cursor-pointer transition-all relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  {imageFile ? (
                    <span className="text-xs text-blue-400 font-bold block">
                      {imageFile.name}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 block">
                      Click to upload damage photo
                    </span>
                  )}
                </div>
              </div>

              {/* Coordinates Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-gray-400 font-bold block">
                    Pin Location Coordinates
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetecting}
                    className="flex items-center gap-1.5 bg-blue-600/10 hover:bg-blue-600/20 active:bg-blue-600/30 text-blue-400 font-bold py-1.5 px-3 rounded-lg border border-blue-500/20 transition-all text-[11px] cursor-pointer"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isDetecting ? "animate-spin" : ""}`} />
                    {isDetecting ? "Detecting..." : "Detect Location"}
                  </button>
                </div>
                <LocationPicker
                  lat={latitude}
                  lng={longitude}
                  onChange={(lat, lng, addr) => {
                    setLatitude(lat);
                    setLongitude(lng);
                    setAddress(addr);
                    localStorage.setItem(
                      "complaint_location",
                      JSON.stringify({ lat, lng, addr })
                    );
                  }}
                />
                <div className="flex gap-4 text-[10px] text-gray-500">
                  <span>
                    Lat:{" "}
                    <strong className="text-gray-300">
                      {latitude.toFixed(6)}
                    </strong>
                  </span>
                  <span>
                    Lng:{" "}
                    <strong className="text-gray-300">
                      {longitude.toFixed(6)}
                    </strong>
                  </span>
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    const newAddr = e.target.value;
                    setAddress(newAddr);
                    localStorage.setItem(
                      "complaint_location",
                      JSON.stringify({ lat: latitude, lng: longitude, addr: newAddr })
                    );
                  }}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-white"
                  title="Detailed Address"
                />
              </div>

              {/* Action row */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleAIAnalyze}
                  disabled={isAnalyzing}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold py-3 rounded-xl border border-blue-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Brain className="w-4 h-4" />
                  {isAnalyzing ? "AI Reviewing..." : "Run AI Analysis"}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/15"
                >
                  {isSubmitting ? "Registering..." : "Submit Complaint"}
                </button>
              </div>
            </form>
          </div>

          {/* AI prediction details */}
          <div className="space-y-6">
            {aiResult ? (
              <div className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-5 space-y-4 shadow-xl">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Brain className="text-blue-500 w-4 h-4" />
                  AI Suggested Parameters
                </h3>

                <div className="text-xs space-y-3">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Predicted Category</span>
                    <span className="font-bold text-gray-200">
                      {aiResult.ai_category}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Department Routing</span>
                    <span className="font-bold text-gray-200">
                      {aiResult.department}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Priority Level</span>
                    <span
                      className={`font-bold ${
                        aiResult.priority === "Critical"
                          ? "text-red-400"
                          : "text-blue-400"
                      }`}
                    >
                      {aiResult.priority}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Severity Metric</span>
                    <span className="font-bold text-gray-200">
                      {aiResult.severity}/10
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Estimated Resolution</span>
                    <span className="font-bold text-gray-200">
                      {aiResult.estimated_resolution_hours} hours
                    </span>
                  </div>
                </div>

                {/* Duplicate Warning */}
                {aiResult.is_duplicate && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-red-400">
                        Potential Duplicate Found
                      </h4>
                      <p className="text-[10px] text-gray-400 leading-relaxed mt-0.5">
                        A similar complaint (ID: {aiResult.duplicate_of}) has
                        already been filed in your locality.
                      </p>
                    </div>
                  </div>
                )}

                {/* Spam Alert */}
                {aiResult.is_spam && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-400">
                        Spam Warning Flagged
                      </h4>
                      <p className="text-[10px] text-gray-400 leading-relaxed mt-0.5">
                        This text has been flagged as potential spam.
                        Submissions marked as spam will be auto-rejected.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-6 text-center text-xs text-gray-500 font-medium">
                Click &quot;Run AI Analysis&quot; to preview how the AI will
                classify and route your grievance.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
