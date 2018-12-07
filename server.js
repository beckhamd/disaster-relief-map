const express = require('express');
const nconf = require('nconf');
const morgan = require('morgan');
const handlebars = require('express-handlebars').create({
  defaultLayout: 'main'
});
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { check, validationResult } = require('express-validator/check');
const flash = require('connect-flash');
const path = require('path');
const pg = require('pg');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

nconf
  .argv()
  .env()
  .file({ file: 'config.json' });

const pool = new pg.Pool({
  host: nconf.get('POSTGRES_HOST'),
  user: nconf.get('POSTGRES_USER'),
  password: nconf.get('POSTGRES_PASSWORD'),
  database: nconf.get('POSTGRES_DATABASE')
});

const app = express();

app.use(morgan('dev'));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 8080);

app.use(express.static(path.join(__dirname, 'public')));

// Passport session setup (serialize user)

passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Passport session setup (deserialize user)

passport.deserializeUser((id, done) => {
  pool.query('SELECT * FROM users WHERE id = $1', [id], (err, res) => {
    if (err) {
      return done(err);
    } else {
      done(err, res.rows[0]);
    }
  });
});

// Passport local strategy (sign up)

passport.use(
  'local-signup',
  new localStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    (req, username, password, done) => {
      pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username],
        (err, res) => {
          if (err) {
            return done(err);
          }

          if (res.rows.length) {
            return done(
              null,
              false,
              req.flash('error', 'Username already taken')
            );
          } else {
            let newUser = {
              username: username,
              password: bcrypt.hashSync(password, 10)
            };

            let insertQuery =
              'INSERT INTO users (username, password) values ($1, $2) RETURNING *';

            pool.query(
              insertQuery,
              [newUser.username, newUser.password],
              (err, res) => {
                if (err) {
                  return done(err);
                } else {
                  newUser.id = res.rows[0].id;
                  return done(null, newUser);
                }
              }
            );
          }
        }
      );
    }
  )
);

// Passport local strategy (sign in)

passport.use(
  'local-signin',
  new localStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    (req, username, password, done) => {
      pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username],
        (err, res) => {
          if (err) {
            return done(err);
          }

          if (!res.rows.length) {
            return done(null, false, req.flash('error', 'No such username'));
          }

          if (!bcrypt.compareSync(password, res.rows[0].password)) {
            return done(null, false, req.flash('error', 'Incorrect password'));
          }

          return done(null, res.rows[0]);
        }
      );
    }
  )
);

// Home (GET)

app.get('/', (req, res) => {
  res.render('index', {
    user: req.user,
    successMessage: req.flash('success')
  });
});

// Sign in (GET)

app.get('/signin', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('account');
  } else {
    res.render('signin', {
      errorMessage: req.flash('error')
    });
  }
});

// Sign in (POST)

app.post(
  '/signin',
  passport.authenticate('local-signin', {
    successRedirect: '/',
    failureRedirect: '/signin',
    successFlash: 'Successfully signed in',
    failureFlash: true
  }),
  (req, res) => {
    if (req.body.remember) {
      req.session.cookie.maxAge = 60000;
    } else {
      req.session.cookie.expires = false;
    }

    res.redirect('/');
  }
);

// Sign up (GET)

app.get('/signup', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('account');
  } else {
    res.render('signup', {
      errorMessage: req.flash('error')
    });
  }
});

// Sign up (POST)

app.post(
  '/signup',
  check('password')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters in length'),
  check('username')
    .isLength({ min: 2 })
    .withMessage('Username must be at least 2 characters in length')
    .isAlphanumeric()
    .withMessage('Username must be alphanumeric'),
  (req, res, next) => {
    let result = validationResult(req);

    if (!result.isEmpty()) {
      let errors = result.array().map(err => {
        return err.msg;
      });

      req.flash('error', errors.join('<br >'));
      res.redirect('/signup');
    } else {
      next();
    }
  },
  passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    successFlash: 'Account successfully created',
    failureFlash: true
  })
);

// Account (GET)

app.get('/account', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('account', {
      user: req.user,
      successMessage: req.flash('success'),
      errorMessage: req.flash('error')
    });
  } else {
    res.redirect('/signin');
  }
});

// Change password (POST)

app.post(
  '/account/password',
  check('password')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters in length')
    .custom((value, { req, loc, path }) => {
      if (value !== req.body.confirmPassword) {
        return false;
      } else {
        return value;
      }
    })
    .withMessage('Passwords do not match'),
  (req, res) => {
    if (req.user.id === 1) {
      req.flash('error', 'Password on this account may not be changed');
      res.redirect('/account');
    } else {
      let result = validationResult(req);

      if (!result.isEmpty()) {
        let errors = result.array().map(err => {
          return err.msg;
        });

        req.flash('error', errors.join('<br >'));
        res.redirect('/account');
      } else {
        let updateQuery = 'UPDATE users SET password = $1 WHERE id = $2';

        pool.query(
          updateQuery,
          [bcrypt.hashSync(req.body.password, 10), req.user.id],
          (pgErr, pgRes) => {
            if (pgErr) {
              return next(pgErr);
            }

            req.flash('success', 'Password successfully changed');
            res.redirect('/account');
          }
        );
      }
    }
  }
);

// Sign out (GET)

app.get('/signout', (req, res) => {
  req.logout();
  req.flash('success', 'Successfully signed out');
  res.redirect('/');
});

app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('500 Internal Server Error');
});

// Listen on specified port

app.listen(app.get('port'), () => {
  console.log(
    'Express started on port ' +
      app.get('port') +
      '; press Ctrl-C to terminate.'
  );
});
