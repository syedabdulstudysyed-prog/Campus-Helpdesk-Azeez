# Presidency University Campus Helpdesk

The helpdesk runs locally and answers questions from its built-in university information. It does not call an AI provider and does not require API keys.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Open http://localhost:3000

Questions outside the local helpdesk information receive a response directing students to reception or the relevant university office.

The optional Flask server uses the same offline answers. To run it instead:

1. Install its dependency: `pip install -r requirements.txt`
2. Run `python app.py`
3. Open http://127.0.0.1:5000
# Campus-helpdesk
