# Cisco iOS config generator
This is a form with dynamically addable VLANs and port forwarding meant to make life easier when configuring Cisco routers. Enter the router information into the form and click "generate" to output a configuration into your browser.

Router configs can be added and fully customised utilising Jinja2 templating under the /configs/ directory, and added as a field in /templates/index.html file.

This utilises flask for lightweight usage. You can run a server by entering python server.py in the working directory, however this can be hosted as seen fit.

## Demo video

[![Watch the video](https://img.youtube.com/vi/bxJ3f00kdR8/maxresdefault.jpg)](https://www.youtube.com/watch?v=bxJ3f00kdR8)
