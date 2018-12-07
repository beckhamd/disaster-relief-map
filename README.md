# Disaster Relief Map
### [Live Demo](https://disaster-relief-map.appspot.com/)

This is a small web app that allows users to drop pins on a map provided by the Google Maps API. It is powered by Express and features a basic user authentication system written with the help of Passport.js.

## Instructions
This app is configured for use on Google App Engine. Follow these instructions in order to use and deploy it:
* On the Google Cloud Platform Console, create a Cloud SQL PostgreSQL instance.
* Import the provided `database.sql` file.
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
* Deploy the app:
  ```
  gcloud app deploy
  ```
