// API Response Types
export interface StudentInfo {
  ma_sinh_vien: string;
  ten_sinh_vien: string;
  phai: string;
  noi_sinh: string;
  khoa: string;
  nganh: string;
  lop: string;
  khoa_hoc: string;
  he_dao_tao: string;
  co_van_hoc_tap: string;
}

export interface GradeProjection {
  current_cgpa: number;
  current_classification: string;
  current_classification_en: string;
  total_credits: number;
  remaining_credits: number;
  projections: Record<string, ProjectionDetail>;
}

export interface ProjectionDetail {
  achievable: boolean;
  classification_en: string;
  remaining_credits: number;
  required_gpa_remaining: number;
  status: "higher" | "current" | "lower";
  target_min_gpa: number;
}

export interface RawGradeEntry {
  STT: string;
  "Mã Môn"?: string;
  "Tên Môn"?: string;
  TC?: string;
  "TK(CH)"?: string;
  "TK(10)"?: string;
  "TK1(CH)"?: string;
  "TK1(10)"?: string;
  "Thi L1"?: string;
  "Bài tập"?: string;
  "Kiểm tra"?: string;
  "% QT"?: string;
  "% KT"?: string;
  "% Thi"?: string;
}

export interface GradeRecord {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  score: number;
  homework?: string;
  midterm?: string;
  final?: string;
}

export interface SemesterGrades {
  semester: string;
  courses: GradeRecord[];
  semesterGpa?: number;
  cumulativeGpa?: number;
  creditsPassed?: number;
  cumulativeCredits?: number;
}

export interface GradesApiResponse {
  success: boolean;
  message: string;
  data: {
    student_info: StudentInfo;
    grades: RawGradeEntry[];
    grade_projection: GradeProjection;
    last_updated: string;
  };
}

export interface ProcessedGradesData {
  studentInfo: StudentInfo;
  semesters: SemesterGrades[];
  gradeProjection: GradeProjection;
  lastUpdated: string;
  allCourses: GradeRecord[];
}

const API_URL = "http://localhost:5000";

// Helper function to convert letter grade to GPA points
export const gradeToGpa = (grade: string): number => {
  const gradeMap: Record<string, number> = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    "D-": 0.7,
    F: 0.0,
  };
  return gradeMap[grade] ?? 0;
};

// Process raw API data into structured format
export const processGradesData = (
  rawData: GradesApiResponse["data"]
): ProcessedGradesData => {
  const semesters: SemesterGrades[] = [];
  const allCourses: GradeRecord[] = [];
  let currentSemester: SemesterGrades | null = null;

  for (const entry of rawData.grades) {
    // Check if this is a semester header (starts with "Học kỳ")
    if (entry.STT.startsWith("Học kỳ")) {
      if (currentSemester) {
        semesters.push(currentSemester);
      }
      currentSemester = {
        semester: entry.STT,
        courses: [],
      };
    }
    // Check if this is a summary line
    else if (entry.STT.startsWith("Điểm trung bình học kỳ hệ 4:")) {
      if (currentSemester) {
        const gpa = parseFloat(entry.STT.split(":")[1]);
        currentSemester.semesterGpa = gpa;
      }
    } else if (entry.STT.startsWith("Điểm trung bình tích lũy (hệ 4):")) {
      if (currentSemester) {
        const gpa = parseFloat(entry.STT.split(":")[1]);
        currentSemester.cumulativeGpa = gpa;
      }
    } else if (entry.STT.startsWith("Số tín chỉ đạt:")) {
      if (currentSemester) {
        const credits = parseInt(entry.STT.split(":")[1]);
        currentSemester.creditsPassed = credits;
      }
    } else if (entry.STT.startsWith("Số tín chỉ tích lũy:")) {
      if (currentSemester) {
        const credits = parseInt(entry.STT.split(":")[1]);
        currentSemester.cumulativeCredits = credits;
      }
    }
    // Check if this is a course entry (has course code)
    else if (entry["Mã Môn"] && entry["Tên Môn"]) {
      const course: GradeRecord = {
        id: entry.STT,
        courseCode: entry["Mã Môn"],
        courseName: entry["Tên Môn"],
        credits: parseInt(entry.TC || "0"),
        grade: entry["TK(CH)"] || "",
        score: parseFloat(entry["TK(10)"] || "0") || 0,
        homework: entry["Bài tập"],
        midterm: entry["Kiểm tra"],
        final: entry["Thi L1"],
      };

      if (currentSemester) {
        currentSemester.courses.push(course);
      }

      // Only add completed courses to allCourses
      if (course.grade && course.grade !== "" && course.grade !== "NA") {
        allCourses.push(course);
      }
    }
  }

  // Push the last semester
  if (currentSemester) {
    semesters.push(currentSemester);
  }

  return {
    studentInfo: rawData.student_info,
    semesters,
    gradeProjection: rawData.grade_projection,
    lastUpdated: rawData.last_updated,
    allCourses,
  };
};

export interface GradesCredentials {
  username: string;
  password: string;
}

export const getGrades = async (
  credentials: GradesCredentials
): Promise<ProcessedGradesData> => {
  if (!credentials.username || !credentials.password) {
    throw new Error("Credentials are required. Please log in first.");
  }

  const response = await fetch(`${API_URL}/api/grades`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch grades. Please check your credentials.");
  }

  const data: GradesApiResponse = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch grades");
  }

  return processGradesData(data.data);
};

export interface GradePredictor {
  currentGpa: number;
  totalCredits: number;
  targetGpa: number;
}

export const predictGpa = async (
  predictor: GradePredictor
): Promise<string> => {
  const neededAverage =
    (predictor.targetGpa * (predictor.totalCredits + 12) -
      predictor.currentGpa * predictor.totalCredits) /
    12;

  if (neededAverage > 4.0) {
    return `Your target GPA of ${
      predictor.targetGpa
    } is not achievable. You would need an average of ${neededAverage.toFixed(
      2
    )} (which exceeds 4.0) in your next 12 credits.`;
  } else if (neededAverage < 0) {
    return `You've already exceeded your target GPA of ${predictor.targetGpa}! Keep up the great work.`;
  }

  return `You need to achieve an average of ${neededAverage.toFixed(
    2
  )} in your next 12 credits to reach your target GPA of ${
    predictor.targetGpa
  }.`;
};

export const analyzeGrades = async (rawData: string): Promise<void> => {
  console.log("Analyzing grades", rawData);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};
