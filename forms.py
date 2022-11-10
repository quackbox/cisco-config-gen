from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, SelectField, PasswordField, BooleanField
from wtforms.validators import DataRequired, IPAddress, StopValidation

class ConfigForm(FlaskForm):
    def __init__(self, var=None, new_vlan=None):
        super(ConfigForm, self).__init__()
        
        if new_vlan:
            pass

    hostname = StringField(
        'Hostname',
        [DataRequired()]
    )
    password = PasswordField(
        'Password',
        [DataRequired()]
    )
    primary_dns = StringField(
        'Primary IPv4 DNS Server',
        [IPAddress(ipv4=True, ipv6=False, message='Please enter a valid IPv4 address')]
    )
    secondary_dns = StringField(
        'Secondary IPv4 DNS Server',
        [IPAddress(ipv4=True, ipv6=False, message='Please enter a valid IPv4 address')]
    )
    vl1_gateway = StringField(
        'VLAN1 interface IP',
        [IPAddress(ipv4=True, ipv6=False, message='Please enter a valid IPv4 address')]
    )
    vl1_cidr_prefix = SelectField(
        'VLAN1 interface IP prefix (CIDR)',
        choices=[('/31'), ('/30'), ('/29'), ('/28'), ('/27'), ('/26'), ('/25'), ('/24'), ('/23'), ('/22'), ('/21'), ('/20'), ('/19'), ('/18'), ('/17'), ('/16')],
        default=('/24')
    )
    vl1_dhcp_server = BooleanField(
        'Enable DHCPv4 server on VLAN 1'
    )
    fgt_model = SelectField(
        'Fortigate model',
        choices=[('40F'), ('60F'), ('80F')],
        default=('40F')
    )
    wan_type = SelectField(
        'WAN connection type',
        choices=[('IPoE'), ('PPPoE'), ('Static IP')],
        default=('IPoE')
    )
    generate = SubmitField('Generate')