from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os

medical_bp = Blueprint("medical", __name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

@medical_bp.route("/chat", methods=["POST"])
def medical_chat():
    try:
        data = request.json
        user_message = data.get("message", "")
        if not user_message:
            return jsonify({"error": "No message"}), 400
        response = model.generate_content(
            f"Answer briefly in 2-3 sentences: {user_message}"
        )
        reply = response.text if hasattr(response, "text") else response.candidates[0].content.parts[0].text
        return jsonify({"response": reply.strip()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
