from flask import Flask, render_template, request, send_from_directory
from flask_restful import Api, Resource, reqparse
from ipaddress import IPv4Network
import jinja2

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
                usable_addresses = list(format(host_addr) for host_addr in IPv4Network(values["v{}ipv4".format(index[1:2])][0] + values["v{}ipPre".format(index[1:2])][0], False).hosts())
                vlans[vlan_id] = {
                    "gateway": values["v{}ipv4".format(index[1:2])][0],
                    "mask": IPv4Network("0.0.0.0" + values["v{}ipPre".format(index[1:2])][0]).netmask,
                    "native": True if index[1:2] == "1" else False,
                    "dhcpv4_enabled": True if "v{}dhcpEN".format(index[1:2]) in values else False,
                    "id": vlan_id,
                    "dhcpv4_first": [usable_addresses[0], usable_addresses[-5]],
                    "dhcpv4_last": [usable_addresses[9], usable_addresses[-1]],
                    "network_addr": format(IPv4Network(values["v{}ipv4".format(index[1:2])][0] + values["v{}ipPre".format(index[1:2])][0], False).network_address),
                }

    configs_loader = jinja2.FileSystemLoader(searchpath="./configs")
    template_env = jinja2.Environment(loader=configs_loader)
    template = template_env.get_template(model + ".ios")
    output = template.render(
        hostname = hostname,
        primary_dns = primary_dns,
        secondary_dns = secondary_dns,
        password = password,
        wan_type = wan_type,
        vlans = vlans
    )
    with open("output/{}.txt".format(hostname.lstrip("/").lstrip(".")), "w") as f:
        f.write(output)

    return 200

class TestResponse(Resource):
    def get(self):
        return {"test":"get"}, 200
    
    def post(self):
        values = request.form.to_dict(flat=False)
        response_status = generate_config(values)

        return {"type":"post"}, response_status

api.add_resource(TestResponse, "/generate")

@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

@app.route("/configs/<path:filename>", methods=["GET"])
def download_config(filename):
    return send_from_directory(directory="output", path=filename.lstrip("/").lstrip(".") + ".txt")

if __name__ == "__main__":
    app.run(debug=True)