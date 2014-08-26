Current Capabilities
========
 - Search GitHub for packages
 - Automatic selection for searches where it's obvious which package the user is looking for
 - Color coded repository properties to evaluate popularity and ease of porting
 - Graph of language composition
 - Attempts to infer build steps based on repository contents
 - Can add a job to Jenkins and fill in configuration values with one click
 - Caches repository data from GitHub API to reduce API usage and improve performance


Dependencies
========
Install [pip](https://pip.pypa.io/en/latest/installing.html) and then run these commands to install dependencies:

    pip install Flask
    pip install PyGithub
    pip install requests

Running
========
After installing dependencies, simply clone the repo and run:

    python main.py

Navigate to http://127.0.0.1:5000/ to access the app.

Deployment
========
See the [Flask documentation](http://flask.pocoo.org/docs/0.10/deploying/#deployment) for details on deploying.

Recommended Reading
========
 - [Flask Quickstart](http://flask.pocoo.org/docs/0.10/quickstart/)
 - [Rivets.js Guide / Binder Reference](http://rivetsjs.com/)
 - [Bootstrap CSS / Components](http://getbootstrap.com/)
 - [PyGithub Documentation](http://jacquev6.github.io/PyGithub/v1/)
 - [GitHub API Rate Limiting](https://developer.github.com/v3/#rate-limiting)

Design Overview
========
Stack
------
The backend runs on Python using the Flask microframework. On the front end, Bootstrap, Rivets.js, jQuery, and a few other libraries are used to acquire and render content.

Data Flow
------
When the client first loads the web app, the backend sends templates/main.html to the client as a response. This file represents the entire clientside of the application and utilizes several CSS and JavaScript files. When the client performs an action such as searching for a new project or clicking the "Add to Jenkins" button, an asynchronous request is made to the backend. The backend responds with JSON data, which is then interpreted and displayed on the clientside.

Backend
------
The backend consists of main.py, which defines endpoints such as /, /search, /detail/<id>, and /createJob. It uses PyGithub to make GitHub api requests. The / route returns main.html, all others return only JSON. Other files such as buildAnalyzer.py and classifiers.py are called upon to perform analysis of repositories.

Frontend
------
main.html defines the structure for the entire application. main.js defines a few state variables that contain data about the various views of the application (loading panel, search results, detail page). Rivets.js is used to bind data from these state variables to HTML. Bootstrap is heavily relied on for styling, icons, and other front end components.

Complete list of libraries used
==========
Backend
- [Flask](http://flask.pocoo.org/) - Web application microframework
- [requests](http://docs.python-requests.org/en/latest/) - HTTP requests
- [PyGitHub 1.2.5](https://github.com/jacquev6/PyGithub) - GitHub API wrapper

Frontend
- [Bootstrap](http://getbootstrap.com/) - Frontend framework
- [Rivets.js](http://rivetsjs.com/) - Data binding
- [Wave from SpinKit](https://github.com/tobiasahlin/SpinKit/blob/master/3-wave.html) - Loading animation
- [Chart.js](http://www.chartjs.org/) - Pie chart
- [legend.js](https://github.com/bebraw/Chart.js.legend/blob/master/src/legend.js) - Chart legends
- [TinyColor](https://github.com/bgrins/TinyColor) - Readable text color selection for legend
- [Moment.js](http://momentjs.com/) - Date manipulation

Next Steps
=========
- Provide numeric estimates for project interest (how useful is this package?) and ease of porting (how hard is it to port?)
- Add an option to fork the repository to IBMSOE before creating a Jenkins job
- Make build step inference more modular and robust
- Set up test reporting for well known test suites such as JUnit
- Replace the Chart.js library with something better to improve the charts / legend.
- Better error handling for failed requests to Jenkins, GitHub, or the backend itself (currently just prints to debug console in most failure cases or does nothing at all).
- Unit tests