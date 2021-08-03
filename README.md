# Mimir

#### Video Demo:

- [https://youtu.be/TVF915nd4ww](https://youtu.be/TVF915nd4ww)

#### Description:

- Hi, this is **Thiago Bernardi**, I am from São Paulo, Brazil, and this is **Mimir**, a note-taking app focused on Markdown I developed for **Harvard University's CS50** course.

- Mimir was born out of the need of taking technical notes with code syntax highlighting when taking courses such as CS50. This app unifies bits and pieces that I particularly find missing in the most popular note-taking commercial apps out there.

- Mimir allows us to write markdown styled notes, categorize, favorite and tag them for enhanced searchability and even stack categories so we can organize notes in incredible ways.

- Mimir is a single-page app developed in vanilla JavaScript in the front-end with a Flask restful API in the backend which uses SQLAlchemy for ORM interfacing with an SQLite database on the development environment and a PostgreSQL database on the production environment. Mimir uses JWT (JSON Web Token) for authentication making use of a refresh and access token security flow where the refresh token is served over an httpOnly cookie and the access token is stored in memory, this prevents CSRF (Cross-Site Request Forgery) attacks and makes Mimir safer in most cases. When logging out, tokens are revoked and a new set has to be re-issued upon submitting user's credentials again. Mimir also makes use of a third-party syntax highlighting library called HighlightJS that will syntax highlight code blocks and Markdown-it which will parse note's markdown text into HTML.

- In production, Mimir was packaged into a Docker container to make it easier to deploy it in any Linux machine, this container is running Nginx, PostgreSQL, the Flask back-end, and Certbot.

- Nginx is being used for proxying the Flask backend with the Javascript/HTML frontend.

- Certbot is used to renew the SSL certificate that secures transactions between end-user in the frontend and the API.

- And PostgreSQL is used as the database with scalability in mind.

- As for the front-end, modern JavaScript development standards were used such as ES6 Modules and bundling the JavaScript/HTML code using ParcelJS.

- Many topics had to be researched during this project's development to the extent of resolving an [unanswered StackOverflow](https://stackoverflow.com/questions/64332569/highlight-code-with-markdown-it-js-and-highlight-js/67220717#67220717) question when reaching a dead-end as I figured out a solution.

- Topics like JSON Web Token security flow, NPM packaging, the use of ES6 Modules, JavaScript Bundlers, ORM database modelling and delete cascade on one-to-many relationships to name a few of the topics that had to be researched and skills that had to be acquired to tackle this project.

- File Structure:

  ```
  ├── README.md
  ├── api_com_pgsql
  │   ├── Dockerfile
  │   ├── backup_run.py
  │   ├── config.py
  │   ├── docker-compose.pgs.yml
  │   ├── docker-compose.yml
  │   ├── emailaction.py
  │   ├── emailtoken.py
  │   ├── entrypoint.sh
  │   ├── gunicorn_config.py
  │   ├── manage.py
  │   ├── mimir_api
  │   │   ├── bin
  │   │   ├── include
  │   │   ├── lib
  │   │   ├── pip-selfcheck.json
  │   │   └── pyvenv.cfg
  │   ├── models.py
  │   ├── requirements.txt
  │   ├── resources.py
  │   ├── run.py
  │   ├── static
  │   │   ├── 1
  │   │   ├── 1406601173
  │   │   ├── 2
  │   │   └── default_avatar.png
  │   ├── templates
  │   │   └── user
  │   ├── views.py
  └── html
  		├── dist
  		├── mimir.code-workspace
  		├── node_modules
  		├── package.json
  		└── src
  			├── assets
  			│   ├── ({markdown\ notes}).png
  			│   ├── ({markdown\ notes})@2x.png
  			│   ├── homepage_art.png
  			│   ├── homepage_art@2x.png
  			│   ├── logo.png
  			│   ├── logo@2x.png
  			│   ├── logo_bg.png
  			│   ├── logo_teste_cinzaAsset\ 4.png
  			│   ├── logo_teste_cinzaAsset\ 4@2x.png
  			│   ├── mimir.png
  			│   ├── mimir@2x.png
  			│   ├── user.png
  			│   └── user@2x.png
  			├── css
  			│   ├── fontawesome.min.css
  			│   ├── highlightjs.css
  			│   ├── main.css
  			│   ├── main.css.map
  			│   └── main.scss
  			├── index.html
  			├── js
  			│   ├── bootstrap.js
  			│   ├── font-awesome-all.js
  			│   ├── jquery.js
  			│   ├── lib
  			│   │   ├── elements.js
  			│   │   ├── handlers.js
  			│   │   ├── index.js
  			│   │   ├── jquery-global.js
  			│   │   └── utils.js
  			│   ├── mimir.js
  			│   ├── popper.js
  			│   └── pwstrength-bootstrap.min.js
  			├── loading.html
  			└── signup.html
  ```

- `api_com_pgsql`: this where the Flask backend is
  - `Dockerfile`: this is the file to Dockerize the Flask backend.
  - `config.py`: contains the settings for our app, this is where we pull our SALTs, secret keys, URLs, addressed, define if it's "production" or development" environment and etc.
  - `docker-compose.pgs.yml`: this is the docker compose for the production environment
  - `docker-compose.yml`: this is the docker compose for the development environment
  - `emailaction.py`: file that is related to the functionality of sending email message on user registration
  - `emailtoken.py`: file that is related to the functionality of generating the token for the email message on user registration
  - `entrypoint.sh`: this file is used in Docker to start gunicorn, this is legacy, not using it anymore.
  - `gunicorn_config.py`: file used to store gunicorn configuration so we don't have to pass them as arguments when invoking the gunicorn.
  - `manage.py`: file containing actions such as create the pgsql database after turning the docker container for the first time
  - `mimir_api`: directory for the python virtual environment
  - `models.py`: file with our database models such as: `notes`, `categories`, `tags`, `user` and so on
  - `requirements.txt`: file generated with `pip freeze > requirements.txt` that has the list of python modules and versions we are using for rapid deployment and also for dockerizing our app
  - `resources.py`: this is the file that has all the API's endpoint functionality code.
  - `run.py`: the main file for our API, this is where we register the endpoints, call `app` and etc.
  - `static`: this directory contains user's uploaded images
    - subdirectories: each subdirectory here is created per user using a deterministic hash function so we can match the directory for each user in our app
  - `templates`
    - `user`: this is where the `activate.html` file resides which is the template for the activation email message we send upon user's registration
  - `views.py`: this contains a single entrypoint which is the root for our API with a simple `Hello World`.
- `html`: this is where the front-end resides
  - `dist`: this is the generated files from `npm run build` script, our frontend bundled with ParcelJS
  - `mimir.code-workspace`: my vscode workspace file
  - `node_modules`: all the files that are installed from npm modules
  - `package.json`: our front-end project settings
  - `src`: this is where the 'raw' files for our front end are
    - `assets`: this is where our layout images are
    - `css`: this is where our css is (`.scss` and generated `.css` files)
    - `index.html`: this is our html main file for our single page app layout
    - `js`: this is where all our `.js` files are located
      - `bootstrap.js`: javascript file from bootstrap
      - `font-awesome-all.js`: javascript file from font awesome
      - `jquery.js`: this is the javascript file for bootstrap's jquery
      - `lib`: this is where our modules files are
        - `elements.js`: javascript module with all elements selectors that I use in the app
        - `handlers.js`: javascript module with all the handlers that I use
        - `index.js`: javascrip module with all functions with `fetch()`
        - `jquery-global.js`: this is a workaround to be able to use jquery (`$`) on JS libaries that rely on `$` and wont work with the regular jquery library from bootstrap
        - `utils.js`: all my utils functions are here
      - `mimir.js`: javascript module **entrypoint**
      - `popper.js`: this is the javascript file for the Popper JS.
      - `pwstrength-bootstrap.min.js`: javascript file for the password strength bootstrap plugin used to measure password strength on user sign up and password change
    - `loading.html`: this is where I created the loading animation I used and later embedded into the app
    - `signup.html`: this is where the signup page was originally and later on embedded into the single page (`index.html`).
