from flask import Flask, render_template, request
from forms import ConfigForm

app = Flask(__name__)
app.config['SECRET_KEY'] = 'abcdefu'


@app.route('/', methods=['POST', 'GET'])
def home():
    form = None
    new_vlan = None

    try:
        new_vlan = request.form.to_dict(flat=False)['new_vlan'][0]
    except:
        pass

    if new_vlan:
        form = ConfigForm(request.form, new_vlan)
    else:
        form = ConfigForm()

    print(dir(form))

    return render_template('home.html', form=form)

if __name__ == '__main__':
    app.run()