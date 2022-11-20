from flask import Flask, render_template, request, send_from_directory
from flask_restful import Api, Resource, reqparse
from ipaddress import IPv4Network
import jinja2

app = Flask(__name__)
api = Api(app)

def mask_to_wildcard(mask):
    octets = mask.split(".")
    new_octets = []

    for octet in octets:
        new_octets.append(str(255 - int(octet)))

    return ".".join(new_octets)

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
    vpns = {}

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
    
    for index in values:
        if index[0:1] == "i" and index[1:2] != "D": # temp
            vpn_id = index[1:2]
            if not vpn_id in vpns:
                vpns[vpn_id] = {
                    "remote_ip": values["i{}ipv4".format(vpn_id)][0],
                    "psk": values["i{}PreSharedKey".format(vpn_id)][0],
                    "ike_encryption": values["i{}Encryption".format(vpn_id)][0],
                    "ike_authentication": values["i{}Authentication".format(vpn_id)][0],
                    "ike_keylifetime": values["i{}KeyLifetime".format(vpn_id)][0],
                    "ipsec_encryption": values["i{}Encryption2".format(vpn_id)][0],
                    "ipsec_authentication": values["i{}Authentication2".format(vpn_id)][0],
                    "remote_subnet_addr": values["i{}ripv4".format(vpn_id)][0],
                    "remote_subnet_mask": IPv4Network("0.0.0.0" + values["i{}ripv4Pre".format(vpn_id)][0]).netmask,
                    "remote_subnet_wildcard": mask_to_wildcard(format(IPv4Network("0.0.0.0" + values["i{}ripv4Pre".format(vpn_id)][0]).netmask)),
                    "local_subnet_addr": values["i{}lipv4".format(vpn_id)][0],
                    "local_subnet_mask": IPv4Network("0.0.0.0" + values["i{}lipv4Pre".format(vpn_id)][0]).netmask,
                    "local_subnet_wildcard": mask_to_wildcard(format(IPv4Network("0.0.0.0" + values["i{}lipv4Pre".format(vpn_id)][0]).netmask))
                }

    print(vpns)

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
        bps = bps,
        vpns = vpns
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