import { useCallback, useEffect, useRef, useState } from "react";
import { TRIAGE_API } from "../config/api.js";
import { getAuthHeaders, isVerifiedGoogleUser } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSignInModal } from "../context/SignInModalContext.jsx";
import InstallAppBanner from "./InstallAppBanner.jsx";
import HeaderAuthNav from "./HeaderAuthNav.jsx";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartPulse,
  Loader2,
  MapPin,
  Navigation,
  Bandage,
  Shield,
  Sparkles,
  Stethoscope,
  Users,
  X,
} from "lucide-react";

const MEDICAL_IMAGES = {
  hero: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80",
  consultation:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80",
  hospitalHall:
    "https://images.unsplash.com/photo-1586773860418-d47a27db62c1?auto=format&fit=crop&w=900&q=80",
  cardiology:
    "https://impactspecialityclinics.com/wp-content/uploads/2025/08/23-1320x700.png",
  neurology:
    "https://www.ayushmanhhs.in/wp-content/uploads/2024/03/Neurological-Disorders-612x321.jpg",
  orthopaedics:
    "https://www.drrohitchakor.com/wp-content/uploads/2023/07/knee-pain.jpg",
};

const API_BASE = TRIAGE_API;

const DEPARTMENT_INFO = {
  "General OPD": {
    location: "Ground Floor · Block A",
    desk: "Reception Desk 3",
    estimatedWait: "15–30 minutes",
    steps: [
      "Enter the main hospital lobby",
      "Turn left past the pharmacy counter",
      "Follow signs to General OPD — Desk 3",
      "Show your queue number at reception",
    ],
  },
  Cardiology: {
    location: "1st Floor · Block B",
    desk: "Cardiology Reception",
    estimatedWait: "10–20 minutes",
    steps: [
      "Take the elevator to Floor 1, Block B",
      "Turn right at the cardiac care signage",
      "Check in at Cardiology reception",
    ],
  },
  Neurology: {
    location: "2nd Floor · Block C",
    desk: "Neurology Front Desk",
    estimatedWait: "20–40 minutes",
    steps: [
      "Take the elevator to Floor 2, Block C",
      "Follow blue Neurology wayfinding signs",
      "Present your queue number at the desk",
    ],
  },
  Orthopaedics: {
    location: "Ground Floor · Block D",
    desk: "Ortho Check-in Counter",
    estimatedWait: "25–45 minutes",
    steps: [
      "From the lobby, walk toward Block D",
      "Pass outpatient registration",
      "Check in at the Orthopaedics counter",
    ],
  },
  Emergency: {
    location: "Ground Floor · Emergency Wing",
    desk: "Emergency Triage Bay",
    estimatedWait: "Immediate",
    steps: [
      "Go directly to the Emergency entrance",
      "Do not wait in the general OPD queue",
      "Inform staff of your symptoms immediately",
    ],
  },
};

const DEFAULT_DEPARTMENT_INFO = {
  location: "Main Hospital — follow staff directions",
  desk: "Nearest reception desk",
  estimatedWait: "Varies",
  steps: ["Proceed to the recommended department reception", "Present your queue number"],
};

function getDepartmentInfo(department) {
  return DEPARTMENT_INFO[department] ?? DEFAULT_DEPARTMENT_INFO;
}

const DEMO_PRESETS = [
  {
    label: "Chest Pain Demo",
    text: "chest pain and left arm numbness",
    short: "Cardiac emergency scenario",
    image: MEDICAL_IMAGES.cardiology,
  },
  {
    label: "Neurology Demo",
    text: "severe headache and sudden blurry vision",
    short: "Urgent neurological symptoms",
    image: MEDICAL_IMAGES.neurology,
  },
  {
    label: "Orthopaedics Demo",
    text: "twisted ankle playing basketball, swelling",
    short: "Routine musculoskeletal injury",
    image: MEDICAL_IMAGES.orthopaedics,
  },
];

const TRUST_FEATURES = [
  { icon: Sparkles, label: "AI-Powered Triage" },
  { icon: Shield, label: "HIPAA-Ready Design" },
  { icon: Users, label: "Multi-Department Routing" },
  { icon: Clock, label: "Real-Time Assessment" },
];

const JUDGE_PRESETS = {
  "chest pain and left arm numbness": {
    likelyConcern: "Acute Coronary Syndrome",
    department: "Cardiology",
    urgencyLevel: "Emergency",
    explanation:
      "Symptoms indicate potential acute coronary syndrome. Immediate evaluation is critical.",
    redAlert: true,
  },
  "severe headache and sudden blurry vision": {
    likelyConcern: "Acute Neurological Event",
    department: "Neurology",
    urgencyLevel: "Urgent",
    explanation:
      "Acute neurological symptoms require rapid assessment to rule out severe underlying conditions.",
    redAlert: false,
  },
  "twisted ankle playing basketball, swelling": {
    likelyConcern: "Ankle Sprain / Minor Fracture",
    department: "Orthopaedics",
    urgencyLevel: "Routine",
    explanation:
      "Presentation consistent with a localized musculoskeletal strain or minor fracture.",
    redAlert: false,
  },
};

function normalizeText(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeFirstAidSteps(value) {
  if (Array.isArray(value) && value.length > 0) {
    return value.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [
    "Rest and stay hydrated while waiting for your appointment.",
    "Monitor symptoms and seek urgent care if they worsen suddenly.",
  ];
}

function normalizeTriageResult(data) {
  return {
    id: data.id != null ? String(data.id) : null,
    likelyConcern: String(data.likelyConcern),
    department: String(data.department),
    urgencyLevel: String(data.urgencyLevel),
    explanation: String(data.explanation),
    firstAidTreatment: normalizeFirstAidSteps(data.firstAidTreatment),
    redAlert: Boolean(data.redAlert),
    checkedIn: Boolean(data.checkedIn),
    queueNumber: data.queueNumber ? String(data.queueNumber) : null,
  };
}

function localQueueNumber(department) {
  const prefix =
    department
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3) || "MR";
  return `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
}

async function proceedToDesk(recordId, department) {
  if (recordId) {
    const response = await fetch(`${API_BASE}/${recordId}/proceed`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Proceed API error: ${response.status}`);
    }
    return normalizeTriageResult(await response.json());
  }
  return {
    queueNumber: localQueueNumber(department),
    checkedIn: true,
  };
}

function mapHistoryEntry(record) {
  const rawTimestamp = record.timestamp ?? record.createdAt;
  let timestamp = "";
  if (rawTimestamp) {
    const date = new Date(rawTimestamp);
    timestamp = Number.isNaN(date.getTime())
      ? String(rawTimestamp)
      : date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
  }

  return {
    id: String(record.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
    symptomInput: record.symptoms ?? record.symptomInput ?? "",
    timestamp,
    likelyConcern: record.likelyConcern,
    department: record.department,
    urgencyLevel: record.urgencyLevel,
    explanation: record.explanation,
    firstAidTreatment: normalizeFirstAidSteps(record.firstAidTreatment),
    redAlert: Boolean(record.redAlert),
  };
}

async function fetchTriageHistory() {
  const response = await fetch(`${API_BASE}/history`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`History API error: ${response.status}`);
  }
  const data = await response.json();
  const records = Array.isArray(data) ? data : [];
  return records.map(mapHistoryEntry);
}

function analyzeSymptomsMock(text) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalized = normalizeText(text);

      for (const [key, preset] of Object.entries(JUDGE_PRESETS)) {
        if (normalized.includes(key)) {
          resolve({ ...preset });
          return;
        }
      }

      const hasEmergency =
        /\b(chest pain|can't breathe|unconscious|severe bleeding|stroke|heart attack)\b/i.test(
          text
        );
      const hasUrgent =
        /\b(high fever|vomiting blood|severe pain|confusion|fainting)\b/i.test(
          text
        );

      if (/\bfever\b/i.test(text)) {
        resolve({
          likelyConcern: "Fever",
          department: "General OPD",
          urgencyLevel: "Routine",
          explanation:
            "Fever is common and often managed in outpatient care. Monitor closely and seek help if symptoms worsen.",
          firstAidTreatment: [
            "Rest in a cool, well-ventilated area and wear light clothing.",
            "Drink water or oral rehydration fluids frequently.",
            "Use paracetamol/acetaminophen as directed if you have no allergy (ask staff if unsure).",
            "Apply a cool compress to forehead or neck for comfort.",
            "Seek urgent care if fever is very high, lasts over 3 days, or you develop rash or confusion.",
          ],
          redAlert: false,
        });
        return;
      }

      if (hasEmergency) {
        resolve({
          likelyConcern: "Potentially Life-Threatening Condition",
          department: "Emergency",
          urgencyLevel: "Emergency",
          explanation:
            "Reported symptoms may indicate a serious acute condition. Seek immediate clinical evaluation.",
          firstAidTreatment: [
            "Alert hospital staff or call emergency services immediately.",
            "Keep still and monitor breathing and responsiveness.",
            "Do not give food or drink unless staff instructs you.",
          ],
          redAlert: true,
        });
        return;
      }

      if (hasUrgent) {
        resolve({
          likelyConcern: "Acute Symptom Complex",
          department: "General OPD",
          urgencyLevel: "Urgent",
          explanation:
            "Symptoms warrant prompt medical assessment within the same day.",
          firstAidTreatment: [
            "Sit or lie down safely; have someone stay with you if possible.",
            "Sip clear fluids if you are not vomiting.",
            "Tell staff immediately if pain or confusion worsens.",
          ],
          redAlert: false,
        });
        return;
      }

      resolve({
        likelyConcern: "General Medical Complaint",
        department: "General OPD",
        urgencyLevel: "Routine",
        explanation:
          "Symptoms appear non-urgent. A standard outpatient evaluation is recommended.",
        firstAidTreatment: [
          "Rest and drink fluids unless staff advises otherwise.",
          "Note when symptoms started and any triggers.",
          "Seek urgent care if symptoms suddenly worsen.",
        ],
        redAlert: false,
      });
    }, 1500);
  });
}

async function saveTriageToDatabase(symptoms, result, patientId) {
  const response = await fetch(`${API_BASE}/save`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      patientId,
      symptoms,
      likelyConcern: result.likelyConcern,
      department: result.department,
      urgencyLevel: result.urgencyLevel,
      explanation: result.explanation,
      firstAidTreatment: result.firstAidTreatment ?? [],
      redAlert: result.redAlert,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Save API error: ${response.status}`);
  }

  return normalizeTriageResult(await response.json());
}

async function analyzeSymptoms(symptoms, patientId, onApiError) {
  const trimmed = symptoms.trim();

  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ symptoms: trimmed, patientId }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Triage API error: ${response.status}`);
    }

    const data = await response.json();
    const result = normalizeTriageResult(data);

    if (result.id) {
      return result;
    }

    return await saveTriageToDatabase(trimmed, result, patientId);
  } catch (analyzeError) {
    console.warn("Analyze API failed, using demo engine:", analyzeError.message);

    const mockResult = await analyzeSymptomsMock(trimmed);
    onApiError?.("Triage server unavailable — using demo engine.");

    try {
      return await saveTriageToDatabase(trimmed, mockResult, patientId);
    } catch (saveError) {
      console.error("Failed to save triage record:", saveError.message);
      onApiError?.("Could not save triage to database. Start the server on port 8080.");
      return { ...mockResult, id: null };
    }
  }
}

function urgencyStyles(level) {
  switch (level) {
    case "Emergency":
      return {
        badge: "bg-red-600 text-white animate-pulse-emergency",
        border: "border-red-500",
        accent: "text-red-700",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
      };
    case "Urgent":
      return {
        badge: "bg-orange-500 text-white",
        border: "border-orange-400",
        accent: "text-orange-700",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
      };
    default:
      return {
        badge: "bg-emerald-600 text-white",
        border: "border-emerald-400",
        accent: "text-emerald-700",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
      };
  }
}

function FirstAidPanel({ steps }) {
  const items = normalizeFirstAidSteps(steps);
  return (
    <div className="mb-6 rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-50 to-emerald-50/50 p-5 ring-1 ring-teal-100">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
          <Bandage className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
            First aid while you wait
          </p>
          <p className="text-xs text-teal-700/80">General guidance — not a prescription</p>
        </div>
      </div>
      <ul className="space-y-2.5">
        {items.map((step) => (
          <li
            key={step}
            className="flex gap-2.5 text-sm leading-relaxed text-slate-700"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="flex h-full flex-col gap-5 p-2" aria-busy="true" aria-label="Analyzing symptoms">
      <div className="h-8 w-48 rounded-lg bg-slate-200 animate-skeleton-pulse" />
      <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-medical-100 animate-skeleton-pulse">
          <Stethoscope className="h-10 w-10 text-medical-300" />
        </div>
        <div className="mx-auto mb-4 h-10 w-3/4 max-w-md rounded-lg bg-slate-200 animate-skeleton-pulse" />
        <div className="mx-auto mb-3 h-6 w-1/2 rounded-lg bg-slate-200 animate-skeleton-pulse" />
        <div className="mx-auto h-24 w-full max-w-lg rounded-lg bg-slate-200 animate-skeleton-pulse" />
      </div>
      <div className="h-12 w-40 rounded-full bg-slate-200 animate-skeleton-pulse" />
    </div>
  );
}

function ProceedGuideModal({
  assessment,
  queueNumber,
  isSubmitting,
  onClose,
  onConfirmNewVisit,
}) {
  const info = getDepartmentInfo(assessment.department);
  const styles = urgencyStyles(assessment.urgencyLevel);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/70 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="proceed-guide-title"
    >
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl">
        <div className="border-b border-slate-100 bg-medical-700 px-6 py-5 text-white">
          <div className="mb-2 flex items-center gap-2 text-medical-200">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Check-in confirmed
            </span>
          </div>
          <h2 id="proceed-guide-title" className="text-2xl font-extrabold">
            Proceed to {assessment.department}
          </h2>
          <p className="mt-1 text-sm text-medical-100">reception desk</p>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="mb-5 rounded-2xl border-2 border-dashed border-medical-200 bg-medical-50 px-5 py-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-medical-600">
              Your queue number
            </p>
            <p className="mt-1 text-4xl font-extrabold tracking-widest text-medical-950">
              {isSubmitting ? "…" : queueNumber}
            </p>
            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles.badge}`}
            >
              {assessment.urgencyLevel}
            </span>
          </div>

          <div className="mb-4 space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-medical-600" />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Location</p>
                <p className="font-semibold text-slate-800">{info.location}</p>
                <p className="text-sm text-slate-600">{info.desk}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-medical-600" />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Estimated wait
                </p>
                <p className="font-semibold text-slate-800">{info.estimatedWait}</p>
              </div>
            </div>
          </div>

          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
            <Navigation className="h-4 w-4 text-medical-600" />
            Directions
          </div>
          <ol className="mb-4 list-inside list-decimal space-y-2 text-sm leading-relaxed text-slate-600">
            {info.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-100">
            Please take a printed queue slip if available, or tell reception your
            number: <strong>{queueNumber}</strong>
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-medical-500"
          >
            Back to results
          </button>
          <button
            type="button"
            onClick={onConfirmNewVisit}
            className="flex-1 rounded-xl bg-medical-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-medical-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-medical-300"
          >
            Start new visit
          </button>
        </div>
      </div>
    </div>
  );
}

function RedAlertModal({ onDismiss }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-red-950/95 p-0 sm:items-center sm:p-6"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="red-alert-title"
      aria-describedby="red-alert-desc"
    >
      <div className="w-full max-w-2xl rounded-t-3xl border-4 border-red-400 bg-white p-6 text-center shadow-2xl sm:rounded-3xl sm:p-10">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-600">
          <AlertTriangle className="h-14 w-14 text-white" strokeWidth={2.5} />
        </div>
        <h2
          id="red-alert-title"
          className="mb-4 text-2xl font-extrabold tracking-tight text-red-700 sm:text-4xl"
        >
          CRITICAL ALERT
        </h2>
        <p
          id="red-alert-desc"
          className="mb-6 text-base font-semibold leading-relaxed text-slate-800 sm:mb-8 sm:text-xl"
        >
          Potential life-threatening symptoms detected. Please alert nearby
          clinical staff <span className="text-red-700 underline">immediately</span>.
          Do not wait in the waiting area.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex min-h-[56px] min-w-[240px] items-center justify-center gap-2 rounded-2xl bg-red-700 px-10 text-lg font-bold text-white transition hover:bg-red-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400"
        >
          <X className="h-6 w-6" />
          Acknowledge — Staff Notified
        </button>
      </div>
    </div>
  );
}

function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 shadow-lg ring-1 ring-amber-100 safe-bottom sm:bottom-6 sm:left-auto sm:right-6"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <p className="flex-1 leading-snug">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-lg p-1 text-amber-700 transition hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function HistoryStrip({ historyLog, onSelect }) {
  if (historyLog.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-medical-200 bg-medical-50/50 px-6 py-8 text-center text-slate-500">
        <Users className="mx-auto mb-2 h-8 w-8 text-medical-300" />
        Session history will appear here after your first assessment.
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-1">
      {historyLog.map((entry) => {
        const styles = urgencyStyles(entry.urgencyLevel);
        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect(entry)}
            className="flex min-w-[min(280px,85vw)] shrink-0 flex-col gap-2 rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-card transition hover:border-medical-400 hover:shadow-medical focus:outline-none focus-visible:ring-2 focus-visible:ring-medical-500 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-700">
                {entry.department}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${styles.badge}`}
              >
                {entry.urgencyLevel}
              </span>
            </div>
            <p className="line-clamp-2 text-xs text-slate-500">{entry.symptomInput}</p>
            <span className="text-xs text-slate-400">{entry.timestamp}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function MedRouteKiosk() {
  const { user } = useAuth();
  const { openSignInModal } = useSignInModal();
  const [patient, setPatient] = useState(null);
  const [symptomInput, setSymptomInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [historyLog, setHistoryLog] = useState([]);
  const [showRedAlertModal, setShowRedAlertModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showProceedGuide, setShowProceedGuide] = useState(false);
  const [proceedQueueNumber, setProceedQueueNumber] = useState(null);
  const [isProceeding, setIsProceeding] = useState(false);

  useEffect(() => {
    if (!user) {
      setPatient(null);
      return;
    }
    if (user.patient) {
      setPatient(user.patient);
    } else if (user.patientId) {
      setPatient({
        id: user.patientId,
        name: user.name,
        age: user.age,
        contactNumber: user.contactNumber,
      });
    }
  }, [user]);

  const showToast = useCallback((message) => {
    setToastMessage(message);
  }, []);

  const dismissToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const loadHistory = useCallback(async () => {
    if (!user?.patientId) {
      setHistoryLog([]);
      return;
    }
    try {
      const entries = await fetchTriageHistory();
      setHistoryLog(entries);
    } catch {
      setHistoryLog([]);
      showToast("Could not load triage history from server.");
    }
  }, [showToast, user?.patientId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const runAnalysis = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || !patient?.id) return;

      setIsLoading(true);
      setAssessmentResult(null);

      let result = await analyzeSymptoms(trimmed, patient?.id, showToast);

      if (!result.id) {
        try {
          result = await saveTriageToDatabase(trimmed, result, patient?.id);
          showToast("Triage saved to database.");
        } catch (saveError) {
          console.error("Persist triage failed:", saveError.message);
          showToast(
            "Analysis complete but could not save. Is the server running on port 8080?"
          );
        }
      }

      setAssessmentResult(result);
      setIsLoading(false);

      if (result.redAlert) {
        setShowRedAlertModal(true);
      }

      await loadHistory();
    },
    [showToast, loadHistory, patient?.id]
  );

  const handleAnalyze = () => {
    if (!isVerifiedGoogleUser(user)) {
      openSignInModal();
      return;
    }
    if (!patient?.id) {
      showToast("Profile loading — try again in a moment.");
      return;
    }
    if (!isLoading) runAnalysis(symptomInput);
  };

  const handlePreset = (text) => {
    if (!isVerifiedGoogleUser(user)) {
      openSignInModal();
      return;
    }
    if (!patient?.id) {
      showToast("Profile loading — try again in a moment.");
      return;
    }
    setSymptomInput(text);
    runAnalysis(text);
  };

  const handleHistorySelect = (entry) => {
    setSymptomInput(entry.symptomInput);
    setAssessmentResult({
      id: entry.id,
      likelyConcern: entry.likelyConcern,
      department: entry.department,
      urgencyLevel: entry.urgencyLevel,
      explanation: entry.explanation,
      firstAidTreatment: normalizeFirstAidSteps(entry.firstAidTreatment),
      redAlert: entry.redAlert,
      checkedIn: entry.checkedIn,
      queueNumber: entry.queueNumber,
    });
    setShowProceedGuide(false);
    setProceedQueueNumber(null);
  };

  const handleProceedToDesk = async () => {
    if (!assessmentResult || isProceeding) return;

    setIsProceeding(true);
    setShowProceedGuide(true);

    try {
      const result = await proceedToDesk(
        assessmentResult.id,
        assessmentResult.department
      );

      const queue = result.queueNumber ?? localQueueNumber(assessmentResult.department);
      setProceedQueueNumber(queue);

      if (result.id || assessmentResult.id) {
        setAssessmentResult((prev) =>
          prev
            ? {
                ...prev,
                checkedIn: true,
                queueNumber: queue,
              }
            : prev
        );
      }

      showToast(`Checked in — queue number ${queue}`);
    } catch {
      const queue = localQueueNumber(assessmentResult.department);
      setProceedQueueNumber(queue);
      showToast("Check-in saved locally — show this queue number at reception.");
    } finally {
      setIsProceeding(false);
    }
  };

  const handleNewVisit = () => {
    setShowProceedGuide(false);
    setProceedQueueNumber(null);
    setSymptomInput("");
    setAssessmentResult(null);
  };

  const triageEnabled = Boolean(isVerifiedGoogleUser(user) && patient?.id);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (assessmentResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [assessmentResult]);

  const styles = assessmentResult
    ? urgencyStyles(assessmentResult.urgencyLevel)
    : null;

  return (
    <div className="mobile-page bg-slate-50 font-sans text-slate-900">
      <Toast message={toastMessage} onDismiss={dismissToast} />
      <InstallAppBanner />
      {showRedAlertModal && (
        <RedAlertModal onDismiss={() => setShowRedAlertModal(false)} />
      )}
      {showProceedGuide && assessmentResult && (
        <ProceedGuideModal
          assessment={assessmentResult}
          queueNumber={
            proceedQueueNumber ??
            assessmentResult.queueNumber ??
            localQueueNumber(assessmentResult.department)
          }
          isSubmitting={isProceeding}
          onClose={() => setShowProceedGuide(false)}
          onConfirmNewVisit={handleNewVisit}
        />
      )}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 shadow-lg backdrop-blur-md safe-top">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-medical-600 shadow-medical sm:h-11 sm:w-11">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:text-xs">
                University Medical Center
              </p>
              <h1 className="truncate text-base font-extrabold tracking-tight text-white sm:text-lg">
                MedRoute AI
              </h1>
            </div>
          </div>

          <HeaderAuthNav />
        </div>

      </header>

      <section className="relative h-36 overflow-hidden sm:h-56 lg:h-64">
        <img
          src={MEDICAL_IMAGES.hero}
          alt="Modern hospital building"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-medical-950/92 via-medical-900/85 to-medical-800/75" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl animate-fade-up">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-medical-200 sm:mb-2 sm:text-sm">
              Intelligent patient routing
            </p>
            <h2 className="text-xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
              Smart triage for faster, safer care
            </h2>
            <p className="mt-2 max-w-xl text-sm text-teal-100/90 sm:text-base">
              Describe your symptoms and our clinical AI will recommend the right
              department and urgency level.
            </p>
          </div>
        </div>
      </section>

      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 py-3 scrollbar-hide sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-6 sm:py-4 lg:px-10">
          {TRUST_FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex min-w-[140px] shrink-0 items-center gap-2.5 text-slate-600 sm:min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-medical-50 text-medical-600">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold sm:text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl bg-mesh-medical px-4 py-6 pb-28 md:pb-10 lg:px-10 lg:py-10">
                {/* Split grid */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Left — Input */}
          <section className="medical-card flex flex-col overflow-hidden lg:flex-col">
            <div className="relative h-40 shrink-0 overflow-hidden sm:h-44">
              <img
                src={MEDICAL_IMAGES.consultation}
                alt="Doctor consulting with patient"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-medical-950/80 via-medical-900/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <h2 className="text-xl font-bold text-white">Describe Your Symptoms</h2>
                <p className="mt-1 text-sm text-teal-100/90">
                  Confidential AI-assisted triage
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
            <p className="mb-4 text-sm leading-relaxed text-slate-600">
              {user ? (
                <>
                  Signed in as <strong>{user.name}</strong>. Enter symptoms in your own words.
                </>
              ) : (
                <>
                  Browse below — click <strong>Sign in</strong> or{" "}
                  <strong>Continue with Google</strong> to run triage.
                </>
              )}
              {" "}Routing guidance only — not a medical diagnosis.
            </p>

            {!isVerifiedGoogleUser(user) && (
              <button
                type="button"
                onClick={openSignInModal}
                className="mb-4 flex w-full items-center gap-2 rounded-xl bg-medical-50 px-4 py-3 text-left text-sm font-medium text-medical-900 ring-1 ring-medical-100 transition hover:bg-medical-100"
              >
                <Shield className="h-4 w-4 shrink-0 text-medical-600" />
                Sign in with Google to unlock symptom analysis.
              </button>
            )}

            <label htmlFor="symptom-input" className="sr-only">
              Symptom description
            </label>
            <textarea
              id="symptom-input"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="e.g., I have been experiencing chest discomfort and shortness of breath since this morning..."
              rows={6}
              disabled={isLoading || !triageEnabled}
              className="mb-4 w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-base leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-medical-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-medical-100 disabled:cursor-not-allowed disabled:opacity-60 sm:mb-5 sm:px-5 sm:py-4 sm:text-lg"
            />

            <div className="mobile-sticky-action md:relative md:mb-6">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isLoading || !symptomInput.trim() || !triageEnabled}
              className="btn-medical-primary min-h-[52px] w-full gap-3 rounded-2xl text-base shadow-medical-lg disabled:cursor-not-allowed sm:min-h-[60px] sm:text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Analyzing Symptoms…
                </>
              ) : (
                <>
                  <Activity className="h-6 w-6" />
                  Analyze &amp; Route
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Demo Presets
              </p>
              <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:grid-cols-3">
                {DEMO_PRESETS.map((preset) => (
                  <button
                    key={preset.text}
                    type="button"
                    onClick={() => handlePreset(preset.text)}
                    disabled={isLoading || !triageEnabled}
                    className="group relative min-h-[100px] overflow-hidden rounded-xl border border-slate-200 text-left shadow-sm transition hover:border-medical-400 hover:shadow-medical focus:outline-none focus-visible:ring-2 focus-visible:ring-medical-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <img
                      src={preset.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-medical-950/90 via-medical-900/50 to-medical-800/20" />
                    <div className="relative flex h-full min-h-[100px] flex-col justify-end p-3">
                      <span className="text-sm font-bold text-white">
                        {preset.label}
                      </span>
                      <span className="mt-0.5 text-xs text-teal-100/90">
                        {preset.short}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            </div>
          </section>

          {/* Right — Results */}
          <section
            ref={resultsRef}
            className="medical-card flex min-h-[360px] flex-col scroll-mt-24 p-4 sm:min-h-[520px] sm:p-6 lg:p-8"
            aria-live="polite"
          >
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-medical-100">
                <Activity className="h-5 w-5 text-medical-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-medical-950">Routing Recommendation</h2>
                <p className="text-xs text-slate-500">AI clinical decision support</p>
              </div>
            </div>

            {isLoading && <ResultsSkeleton />}

            {!isLoading && !assessmentResult && (
              <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200">
                <img
                  src={MEDICAL_IMAGES.hospitalHall}
                  alt="Hospital corridor"
                  className="absolute inset-0 h-full w-full object-cover opacity-35"
                />
                <div className="relative flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-white/95 via-white/92 to-medical-50/90 px-8 py-10 text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-medical-100 ring-4 ring-white shadow-medical">
                    <Stethoscope className="h-10 w-10 text-medical-600" />
                  </div>
                  <p className="max-w-sm text-xl font-semibold text-slate-800">
                    {user
                      ? "Describe your symptoms to receive routing guidance"
                      : "Continue with Google to start triage"}
                  </p>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
                    {user
                      ? "Our clinical AI will assess urgency and recommend the right department."
                      : "Sign in at the top of the page, then describe your symptoms here."}
                  </p>
                </div>
              </div>
            )}

            {!isLoading && assessmentResult && styles && (
              <div className="flex flex-1 flex-col">
                <div
                  className={`flex flex-1 flex-col rounded-2xl border-2 ${styles.border} bg-gradient-to-br from-white to-slate-50 p-8 shadow-inner`}
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <span
                      className={`inline-flex rounded-full px-4 py-1.5 text-sm font-extrabold uppercase tracking-wide ${styles.badge}`}
                    >
                      {assessmentResult.urgencyLevel}
                    </span>
                    {assessmentResult.redAlert && (
                      <span className="flex items-center gap-1 text-sm font-bold text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        Red Alert
                      </span>
                    )}
                  </div>

                  <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Assigned Department
                  </p>
                  <div className="mb-6 flex items-center gap-4">
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg}`}
                    >
                      <MapPin className={`h-8 w-8 ${styles.iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-extrabold leading-tight text-medical-950 sm:text-4xl lg:text-5xl">
                      {assessmentResult.department}
                    </h3>
                  </div>

                  <div className="mb-6 rounded-xl bg-white/80 p-5 ring-1 ring-slate-200">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Likely Concern
                    </p>
                    <p className={`text-xl font-bold ${styles.accent}`}>
                      {assessmentResult.likelyConcern}
                    </p>
                  </div>

                  <p className="mb-6 text-base leading-relaxed text-slate-600">
                    {assessmentResult.explanation}
                  </p>

                  <FirstAidPanel steps={assessmentResult.firstAidTreatment} />

                  <button
                    type="button"
                    onClick={handleProceedToDesk}
                    disabled={isProceeding}
                    className="mt-8 flex w-full items-center gap-3 rounded-xl bg-medical-700 px-6 py-4 text-left text-white transition hover:bg-medical-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-medical-300 disabled:cursor-wait disabled:opacity-80"
                  >
                    {isProceeding ? (
                      <Loader2 className="h-6 w-6 shrink-0 animate-spin" />
                    ) : (
                      <ArrowRight className="h-6 w-6 shrink-0" />
                    )}
                    <p className="text-lg font-semibold">
                      Proceed to{" "}
                      <span className="underline decoration-2 underline-offset-4">
                        {assessmentResult.department}
                      </span>{" "}
                      reception desk
                    </p>
                  </button>
                  {assessmentResult.checkedIn && assessmentResult.queueNumber && (
                    <p className="mt-3 text-center text-sm font-medium text-medical-700">
                      Checked in · Queue{" "}
                      <span className="font-extrabold">
                        {assessmentResult.queueNumber}
                      </span>
                      {" · "}
                      <button
                        type="button"
                        onClick={() => {
                          setProceedQueueNumber(assessmentResult.queueNumber);
                          setShowProceedGuide(true);
                        }}
                        className="underline hover:text-medical-900"
                      >
                        View directions
                      </button>
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* History */}
        <section className="rounded-2xl border border-slate-200/80 bg-white/60 p-4 shadow-card backdrop-blur-sm sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-medical-800">
            <Clock className="h-4 w-4" />
            Recent Triage History
          </h2>
          <HistoryStrip historyLog={historyLog} onSelect={handleHistorySelect} />
        </section>
      </main>

      <footer className="border-t border-medical-900/10 bg-medical-950 py-8 text-center text-sm text-medical-200/80">
        <p className="font-semibold text-white">MedRoute AI Kiosk</p>
        <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed">
          For triage routing assistance only. Not a substitute for professional
          medical advice. In an emergency, call your local emergency number immediately.
        </p>
      </footer>
    </div>
  );
}
