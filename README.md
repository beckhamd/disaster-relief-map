# Disaster Relief Map
[Live Demo](https://disaster-relief-map.appspot.com/)

This is a small web app that allows users to drop pins on a map provided by the Google Maps API. It is powered by Express and features a basic user authentication system written with the help of Passport.js.

## Installation
This app is configured for use on the Google App Engine. Follow these steps in order to install it:
* On the Google Cloud Platform Console, create a Cloud SQL PostgreSQL instance.
* Import the provided `database.sql` file into the the PostgreSQL database.
* Create a `config.json` file in the root directory with the following contents:
  ```
  {
    "POSTGRES_HOST": "/cloudsql/project:region:instance",
    "POSTGRES_USER": "user",
    "POSTGRES_PASSWORD": "password",
    "POSTGRES_DATABASE": "database"
  }
  ```
  Edit the values as necessary in order to supply the correct database information.
* Ensure that the project is set correctly using `gcloud config set project project-name`.
* Deploy the app using `gcloud app deploy`.
