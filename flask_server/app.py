import os
import json
import pandas as pd
import pymongo

from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

mongo_username = os.getenv("MONGO_USERNAME")
mongo_password = os.getenv("MONGO_PASSWORD")
mongo_url = os.getenv("MONGO_URL")

client = MongoClient(mongo_url)
db = client["home_run_data"]
data_collection = db["data"]

verbose = False

def do_print(x, error=False, important=False):
    if error:
        message = f"{pd.Timestamp.now()} ERROR: {x}"
    else:
        message = f"{pd.Timestamp.now()} {x}"

    if verbose or important:
        print(message)

    logfilename = f"./{pd.Timestamp.now().strftime('%Y%m%d')}.log"
    with open(logfilename, "a") as f:
        f.write(message + "\n")

def probability_to_american_odds(probability):
    if probability <= 0 or probability >= 1:
        return "N/A"

    if probability < 0.5:
        return "+" + str(round((1 / probability - 1) * 100))
    else:
        return "-" + str(round(-100 / (probability - 1)))


def get_database():
    client = MongoClient(os.getenv("MONGO_URL"))
    return client["home_run_data"]

@app.route("/", methods=["GET"])
def index():
    return jsonify("Hello world"), 200

@app.route("/get_hr_probs_for_day", methods=["GET"])
def get_hr_probs_for_day():
    if "date" not in request.args:
        return jsonify("Must specify date"), 400

    date = pd.Timestamp(request.args.get("date")).strftime("%Y-%m-%d")
    result = list(data_collection.find({"date": date}, {"_id": 0,
                                                        "player_name": 1,
                                                        "model": 1,
                                                        "did_hit_hr": 1,
                                                        "home_run_odds": 1,
                                                        "stats": 1,
                                                        "odds_data": 1,
                                                        })
                                 .sort("home_run_odds", pymongo.DESCENDING))
    def get_hr_string(i):
        if i == 0:
            return "No"
        elif i == 1:
            return "Yes"
        else:
            assert(i == 2)
            return "---"
    result = [{"Player name": x["player_name"],
               "Model": x["model"],
               "Home run probability": round(x["home_run_odds"], 3),
               "Home run odds": probability_to_american_odds(x["home_run_odds"]),
               "Did hit HR": get_hr_string(x["did_hit_hr"]),
               "stats": x["stats"],
               "odds_data": x["odds_data"] if "odds_data" in x else {},
               } for x in result]

    if result:
        return jsonify(result), 200
    else:
        return jsonify([]), 200

if __name__ == "__main__":
    app.run(debug=True)

