from flask import Flask, render_template, request, jsonify
import numpy as np
import joblib
import pandas as pd
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)


# ======================================================
# LOAD MODELS
# ======================================================

# Price Prediction Model
price_model = joblib.load("price_model.pkl")
le_location = joblib.load("location_encoder.pkl")

# Recommendation System
similarity_matrix = joblib.load("similarity.pkl")
recommend_df = joblib.load("recommend_data.pkl")

# Ensure _id is string (important for API matching)
recommend_df["_id"] = recommend_df["_id"].astype(str)

# Sentiment Model
sentiment_model = joblib.load("sentiment_model.pkl")
sentiment_vectorizer = joblib.load("tfidf_vectorizer.pkl")


# ======================================================
# REVIEW STORAGE SETUP
# ======================================================

REVIEW_FILE = "reviews.csv"

if not os.path.exists(REVIEW_FILE):
    pd.DataFrame(columns=[
        "listing_id",
        "user",
        "rating",
        "comment",
        "timestamp"
    ]).to_csv(REVIEW_FILE, index=False)


# ======================================================
# HOME PAGE (Optional HTML UI)
# ======================================================

@app.route("/")
def home():
    locations = sorted(le_location.classes_)
    return render_template("index.html", locations=locations)


# ======================================================
# FORM PRICE PREDICTION (HTML)
# ======================================================

@app.route("/predict", methods=["POST"])
def predict():
    try:
        location = request.form["location"].strip()

        if location not in le_location.classes_:
            return render_template(
                "index.html",
                locations=sorted(le_location.classes_),
                prediction_text="Location not available in training data."
            )

        location_encoded = le_location.transform([location])[0]

        features = np.array([[
            location_encoded,
            int(request.form["guests"]),
            int(request.form["bedrooms"]),
            int(request.form["beds"]),
            int(request.form["bathrooms"]),
            int(request.form["wifi"]),
            int(request.form["parking"]),
            int(request.form["kitchen"]),
            int(request.form["pool"]),
            int(request.form["gym"]),
            int(request.form["fireplace"]),
            int(request.form["security"])
        ]])

        prediction = price_model.predict(features)[0]

        return render_template(
            "index.html",
            locations=sorted(le_location.classes_),
            prediction_text=f"Estimated Price per Night: ₹{round(prediction, 2)}"
        )

    except Exception as e:
        return render_template(
            "index.html",
            locations=sorted(le_location.classes_),
            prediction_text=f"Error: {str(e)}"
        )


# ======================================================
# PRICE PREDICTION API (Next.js)
# ======================================================

@app.route("/predict-api", methods=["POST"])
def predict_api():
    try:
        data = request.get_json()
        location = data.get("location", "").strip()

        if location not in le_location.classes_:
            return jsonify({"error": "Invalid location"}), 400

        location_encoded = le_location.transform([location])[0]

        features = np.array([[
            location_encoded,
            int(data.get("guests", 1)),
            int(data.get("bedrooms", 1)),
            int(data.get("beds", 1)),
            int(data.get("bathrooms", 1)),
            int(data.get("wifi", 0)),
            int(data.get("parking", 0)),
            int(data.get("kitchen", 0)),
            int(data.get("pool", 0)),
            int(data.get("gym", 0)),
            int(data.get("fireplace", 0)),
            int(data.get("security", 0))
        ]])

        prediction = price_model.predict(features)[0]

        return jsonify({
            "predicted_price": round(float(prediction), 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ======================================================
# SENTIMENT ANALYSIS API
# ======================================================

@app.route("/sentiment-api", methods=["POST"])
def sentiment_api():
    try:
        data = request.get_json()
        review = data.get("review", "").strip()

        if not review:
            return jsonify({"error": "No review provided"}), 400

        # Vectorize first
        vectorized = sentiment_vectorizer.transform([review])
        prediction = sentiment_model.predict(vectorized)[0]

        label_map = {
            0: "negative",
            1: "neutral",
            2: "positive"
        }

        sentiment = label_map.get(prediction, "unknown")

        return jsonify({"sentiment": sentiment})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ======================================================
# RECOMMENDATION API
# ======================================================

@app.route("/recommend-api/<string:listing_id>", methods=["GET"])
def recommend_api(listing_id):
    try:
        if listing_id not in recommend_df["_id"].values:
            return jsonify({"error": "Listing not found"}), 404

        index = recommend_df[recommend_df["_id"] == listing_id].index[0]

        similarity_scores = list(enumerate(similarity_matrix[index]))
        similarity_scores = sorted(
            similarity_scores,
            key=lambda x: x[1],
            reverse=True
        )

        top_indices = [i[0] for i in similarity_scores[1:6]]
        recommendations = recommend_df.iloc[top_indices]

        result = recommendations[[
            "_id",
            "title",
            "location",
            "price",
            "image"
        ]].to_dict(orient="records")

        return jsonify({"recommendations": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ======================================================
# REVIEW SUBMISSION API
# ======================================================

@app.route("/review-api", methods=["POST"])
def review_api():
    try:
        data = request.get_json()

        listing_id = data.get("listing_id")
        user = data.get("user", "Anonymous")
        rating = int(data.get("rating"))
        comment = data.get("comment", "").strip()

        if not listing_id or rating < 1 or rating > 5:
            return jsonify({"error": "Invalid review data"}), 400

        new_review = {
            "listing_id": listing_id,
            "user": user,
            "rating": rating,
            "comment": comment,
            "timestamp": datetime.now().isoformat()
        }

        df_reviews = pd.read_csv(REVIEW_FILE)
        df_reviews = pd.concat(
            [df_reviews, pd.DataFrame([new_review])],
            ignore_index=True
        )

        df_reviews.to_csv(REVIEW_FILE, index=False)

        listing_reviews = df_reviews[df_reviews["listing_id"] == listing_id]
        avg_rating = round(listing_reviews["rating"].mean(), 2)

        return jsonify({
            "message": "Review added successfully",
            "average_rating": avg_rating
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ======================================================
# GET REVIEWS FOR LISTING
# ======================================================

@app.route("/reviews/<string:listing_id>", methods=["GET"])
def get_reviews(listing_id):
    try:
        df_reviews = pd.read_csv(REVIEW_FILE)

        listing_reviews = df_reviews[
            df_reviews["listing_id"] == listing_id
        ]

        reviews = listing_reviews.to_dict(orient="records")

        avg_rating = None
        if not listing_reviews.empty:
            avg_rating = round(listing_reviews["rating"].mean(), 2)

        return jsonify({
            "reviews": reviews,
            "average_rating": avg_rating
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ======================================================
# HEALTH CHECK
# ======================================================

@app.route("/health")
def health():
    return jsonify({"status": "ML service running"})


# ======================================================
# RUN SERVER
# ======================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)