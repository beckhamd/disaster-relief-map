# Disaster Relief Map
### [Live Demo](http://disaster-relief-map.us-east-2.elasticbeanstalk.com/)

This is a small web app that allows users to drop pins on a map provided by the Google Maps API. It is powered by Express and features a basic user authentication system written with the help of Passport.js.

## Instructions
* On the AWS Console, create a new Elastic Beanstalk web server environment. Choose Node.js as the preconfigured platform, and add an Amazon RDS PostgreSQL database to the environment.
* Open the `index.handlebars` template file in the `views` directory. Provide the correct Google Maps API key in place of `YOUR_API_KEY`.
* Deploy the app.
