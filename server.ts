import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type KnowledgeEntry = {
  keywords: string[];
  answer: string;
};

const LOCAL_KNOWLEDGE: KnowledgeEntry[] = [
  {
    keywords: ["academic", "faculty advisor", "course", "class"],
    answer: "For academic-related assistance, contact your faculty advisor.",
  },
  {
    keywords: ["attendance", "attendance percentage"],
    answer: "Follow the minimum attendance requirement in the current university regulations. The local helpdesk information does not specify the applicable percentage, so confirm it with your faculty advisor or the official academic rules.",
  },
  {
    keywords: ["exam", "examination", "timetable", "coe"],
    answer: "Examination timetables and notifications are shared through official university channels. For exam-related help, contact the COE; confirm the correct counter and current timings with reception.",
  },
  {
    keywords: ["placement", "internship", "career", "recruitment"],
    answer: "Contact the Placement Department for placement drives, internships, training, or career guidance. Its exact office location is not confirmed here, so check with reception.",
  },
  {
    keywords: ["library", "law library", "books"],
    answer: "The main library is in the Management Block, and the law library is on the 5th floor of S Block. Check with library staff for current access rules and timings.",
  },
  {
    keywords: ["hostel", "warden", "student housing"],
    answer: "For hostel issues, contact Hostel Administration or the hostel warden (Student Housing). Ask reception or hostel staff for the current office location.",
  },
  {
    keywords: ["certificate", "transcript", "student records", "registrar", "administration"],
    answer: "For certificates or student records, contact the relevant administrative office or Registrar Office. Ask them about the current form and process.",
  },
  {
    keywords: ["event", "university events", "workshop", "fest"],
    answer: "University event announcements are shared through official university communication channels.",
  },
  {
    keywords: ["fee", "fees", "payment", "fee receipt", "dues"],
    answer: "Visit the Fee Counter for fee payments, receipts, outstanding dues, or payment corrections. It is labelled in the central administrative area on the campus map. Confirm the current counter, location, and timings with reception or campus security.",
  },
  {
    keywords: ["admission", "registration", "enrollment", "enrolment"],
    answer: "For admission or registration, go to the Admission Block & Registrar Office and ask reception to direct you to the correct counter.",
  },
  {
    keywords: ["student support", "dsa", "campus issue"],
    answer: "DSA is listed for student support on the campus map. Ask reception whether it is the right desk for your issue and where to report it.",
  },
  {
    keywords: ["medical", "doctor", "first aid", "emergency"],
    answer: "The campus map identifies a Medical Room. Ask security or reception to direct you there; in an emergency, contact campus security immediately.",
  },
  {
    keywords: ["food", "cafeteria", "food points", "atm", "cash"],
    answer: "Use the Food Points shown on the campus map. Ask reception or security where to find the nearest ATM.",
  },
  {
    keywords: ["address", "phone", "contact number", "telephone", "website"],
    answer: "Presidency University is at Rajanukunte, Yelahanka, Bengaluru, Karnataka 560119. The published general contact number is 080-23093500, and the website is presidencyuniversity.in.",
  },
  {
    keywords: ["main gate", "campus map", "main lawn", "fountain", "plaza", "auditorium", "find an office"],
    answer: "If you cannot find an office, start at the Main Gate, security desk, or reception. Tell staff which service you need and ask for the current office location, floor, counter, and working hours. Never share passwords, OTPs, or banking PINs.",
  },
];

function normalizeText(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
}

function answerFromLocalKnowledge(question: string): string {
  const normalizedQuestion = normalizeText(question);
  const bestMatch = LOCAL_KNOWLEDGE
    .map((entry) => ({
      entry,
      score: entry.keywords.reduce((score, keyword) => {
        const normalizedKeyword = normalizeText(keyword);
        return normalizedQuestion.includes(normalizedKeyword)
          ? score + normalizedKeyword.trim().split(" ").length
          : score;
      }, 0),
    }))
    .sort((left, right) => right.score - left.score)[0];

  if (!bestMatch || bestMatch.score === 0) {
    return "I couldn't find verified information for that question in the local helpdesk knowledge base. Please ask reception or contact the relevant university office.";
  }

  return bestMatch.entry.answer;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/ask", (req, res) => {
    const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";

    if (!question) {
      return res.status(400).json({ error: "Please enter a question before sending." });
    }

    const answer = answerFromLocalKnowledge(question);
    return res.json({ answer, response: answer });
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
