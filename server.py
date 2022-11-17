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
    suffix = values["suffix"][0]
    bps = values["bps"][0]
    vlans = {}
    port_forwards = {}

    for index in values:
        if index[0:1] == "v":
            vlan_id = values["v{}ID".format(index[1:2])][0]
            if not vlan_id in vlans:
                usable_addresses = list(format(host_addr) for host_addr in IPv4Network(values["v{}ipv4".format(index[1:2])][0] + values["v{}ipPre".format(index[1:2])][0], False).hosts()) if int(values["v{}ipPre".format(index[1:2])][0].lstrip("/")) <= 26 else None
                vlans[vlan_id] = {
                    "gateway": values["v{}ipv4".format(index[1:2])][0],
                    "mask": IPv4Network("0.0.0.0" + values["v{}ipPre".format(index[1:2])][0]).netmask,
                    "native": True if index[1:2] == "1" else False,
                    "dhcpv4_enabled": True if "v{}dhcpEN".format(index[1:2]) in values and usable_addresses is not None else False,
                    "id": vlan_id,
                    "dhcpv4_first": [usable_addresses[0], usable_addresses[-5]] if usable_addresses is not None else None,
                    "dhcpv4_last": [usable_addresses[9], usable_addresses[-1]] if usable_addresses is not None else None,
                    "network_addr": format(IPv4Network(values["v{}ipv4".format(index[1:2])][0] + values["v{}ipPre".format(index[1:2])][0], False).network_address),
                    "helper_enabled": True if values["v{}Helper".format(index[1:2])][0] != "" else False,
                    "helper_addr": values["v{}Helper".format(index[1:2])][0]
                }

    for index in values:
        if index[0:1] == "p" and index != "pipv4" and index != "pw":
            pfwd_id = index[1:2]
            if not pfwd_id in port_forwards:
                port_forwards[pfwd_id] = {
                    "protocol": values["p{}protocol".format(pfwd_id)][0].lower(),
                    "source": values["p{}sIP".format(pfwd_id)][0] if values["p{}sIP".format(pfwd_id)][0] != "" else "any",
                    "destination": values["p{}iIP".format(pfwd_id)][0],
                    "src_port": values["p{}exPort".format(pfwd_id)][0],
                    "dst_port": values["p{}inPort".format(pfwd_id)][0],
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
        vlans = vlans,
        port_forwards = port_forwards,
        suffix = suffix,
        bps = bps
    )
    with open("output/{}.txt".format(hostname.lstrip("/").lstrip("\\").lstrip(".").lstrip("%")), "w") as f:
        f.write(output)

    return 200

class TestResponse(Resource):
    def get(self):
        return {"test":"get"}, 200
    
    def post(self):
        values = request.form.to_dict(flat=False)
        response_status = generate_config(values)

        #print(values)

        return {"hostname":values["hn"][0]}, response_status

api.add_resource(TestResponse, "/generate")

@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

@app.route("/configs/<path:filename>", methods=["GET"])
def download_config(filename):
    return send_from_directory(directory="output", path=filename.lstrip("/").lstrip("\\").lstrip(".").lstrip("%") + ".txt")

if __name__ == "__main__":
    app.run(debug=True)