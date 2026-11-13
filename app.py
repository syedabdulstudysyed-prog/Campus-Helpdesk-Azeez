import os
import re
from flask import Flask, jsonify, request, send_from_directory


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=BASE_DIR)

LOCAL_KNOWLEDGE = [
    (
        ("academic", "faculty advisor", "course", "class"),
        "For academic-related assistance, contact your faculty advisor.",
    ),
    (
        ("attendance", "attendance percentage"),
        "Follow the minimum attendance requirement in the current university regulations. The local helpdesk information does not specify the applicable percentage, so confirm it with your faculty advisor or the official academic rules.",
    ),
    (
        ("exam", "exams", "examination", "examinations", "timetable", "coe"),
        "Examination timetables and notifications are shared through official university channels. For exam-related help, contact the COE; confirm the correct counter and current timings with reception.",
    ),
    (
        ("placement", "internship", "career", "recruitment"),
        "Contact the Placement Department for placement drives, internships, training, or career guidance. Its exact office location is not confirmed here, so check with reception.",
    ),
    (
        ("library", "law library", "books"),
        "The main library is in the Management Block, and the law library is on the 5th floor of S Block. Check with library staff for current access rules and timings.",
    ),
    (
        ("hostel", "warden", "student housing"),
        "For hostel issues, contact Hostel Administration or the hostel warden (Student Housing). Ask reception or hostel staff for the current office location.",
    ),
    (
        ("certificate", "transcript", "student records", "registrar", "administration"),
        "For certificates or student records, contact the relevant administrative office or Registrar Office. Ask them about the current form and process.",
    ),
    (
        ("event", "events", "workshop", "fest"),
        "University event announcements are shared through official university communication channels.",
    ),
    (
        ("fee", "fees", "payment", "fee receipt", "dues"),
        "Visit the Fee Counter for fee payments, receipts, outstanding dues, or payment corrections. It is labelled in the central administrative area on the campus map. Confirm the current counter, location, and timings with reception or campus security.",
    ),
    (
        ("admission", "registration", "enrollment", "enrolment"),
        "For admission or registration, go to the Admission Block & Registrar Office and ask reception to direct you to the correct counter.",
    ),
    (
        ("student support", "dsa", "campus issue"),
        "DSA is listed for student support on the campus map. Ask reception whether it is the right desk for your issue and where to report it.",
    ),
    (
        ("medical", "doctor", "first aid", "emergency"),
        "The campus map identifies a Medical Room. Ask security or reception to direct you there; in an emergency, contact campus security immediately.",
    ),
    (
        ("food", "cafeteria", "food points", "atm", "cash"),
        "Use the Food Points shown on the campus map. Ask reception or security where to find the nearest ATM.",
    ),
    (
        ("address", "phone", "contact number", "telephone", "website"),
        "Presidency University is at Rajanukunte, Yelahanka, Bengaluru, Karnataka 560119. The published general contact number is 080-23093500, and the website is presidencyuniversity.in.",
    ),
    (
        ("main gate", "campus map", "main lawn", "fountain", "plaza", "auditorium", "find an office"),
        "If you cannot find an office, start at the Main Gate, security desk, or reception. Tell staff which service you need and ask for the current office location, floor, counter, and working hours. Never share passwords, OTPs, or banking PINs.",
    ),
]

FALLBACK_ANSWER = (
    "I couldn't find verified information for that question in the local helpdesk "
    "knowledge base. Please ask reception or contact the relevant university office."
)


def normalize_text(text):
    return f" {re.sub(r'[^a-z0-9]+', ' ', text.lower()).strip()} "


def answer_from_local_knowledge(question):
    normalized_question = normalize_text(question)
    best_answer = FALLBACK_ANSWER
    best_score = 0

    for keywords, answer in LOCAL_KNOWLEDGE:
        score = sum(
            len(normalize_text(keyword).split())
            for keyword in keywords
            if normalize_text(keyword) in normalized_question
        )
        if score > best_score:
            best_answer = answer
            best_score = score

    return best_answer


@app.route("/")
def serve_home():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json(silent=True)
    raw_question = data.get("question") if isinstance(data, dict) else None
    question = raw_question.strip() if isinstance(raw_question, str) else ""

    if not question:
        return jsonify({"error": "Please enter a question."}), 400

    answer = answer_from_local_knowledge(question)
    return jsonify({"answer": answer, "response": answer})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
