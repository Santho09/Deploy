from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("❌ No API key found. Please set GEMINI_API_KEY in .env")

# ✅ Configure Gemini with your key
genai.configure(api_key=API_KEY)

# ✅ Flask setup
app = Flask(__name__)
CORS(app)

# ✅ Use free-friendly Flash model
model = genai.GenerativeModel("gemini-1.5-flash")

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # 🔹 Ask Gemini Flash
        response = model.generate_content(
            f"Provide a short and important response to: {user_message}. Limit the answer to 2-3 sentences."
        )

        # ✅ Extract reply text
        bot_reply = response.text if hasattr(response, "text") else response.candidates[0].content.parts[0].text

        return jsonify({
            "response": bot_reply.strip(),
            "model": "gemini-1.5-flash"
        })

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5006, debug=True)
