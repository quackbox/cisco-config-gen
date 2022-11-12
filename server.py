from flask import Flask, render_template, request
from flask_restful import Api, Resource, reqparse

app = Flask(__name__)
api = Api(app)

def generate_config(values):
    hostname = values["hn"][0]
    password = values["pw"][0]
    primary_dns = values["pipv4"][0]
    secondary_dns = values["sipv4"][0]
    model = values["model"][0]
    wan_type = values["WAN"][0]
    vlans = {}

    for index in values:
        if index[0:1] == "v":
            vlan_id = values["v{}ID".format(index[1:2])][0]
            if not vlan_id in vlans:
                vlans[vlan_id] = {
                    "gateway": values["v{}ipv4".format(index[1:2])][0],
                    "prefix": values["v{}ipPre".format(index[1:2])][0],
                }

    return 200

class TestResponse(Resource):
    def get(self):
        return {"test":"get"}, 200
    
    def post(self):
        values = request.form.to_dict(flat=False)

        for index in values.copy():
            if index[0:2] == "v0":
                values.pop(index)

        response_status = generate_config(values)

        return {"type":"post"}, response_status

api.add_resource(TestResponse, "/generate")

@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)