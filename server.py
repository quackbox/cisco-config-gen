from flask import Flask, render_template, request
from flask_restful import Api, Resource, reqparse

app = Flask(__name__)
api = Api(app)

class TestResponse(Resource):
    def get(self):
        return {"test":"get"}, 200
    
    def post(self):
        return {"type":"post"}, 200

api.add_resource(TestResponse, "/generate")

@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)