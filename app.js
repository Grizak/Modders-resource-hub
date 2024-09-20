const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const app = express();
const MongoStore = require('connect-mongo');

// Set the view engine to EJS
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/moddershub', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
    // Render an error page if needed
  });

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/sorry');
}

// Use bodyParser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

// Use express-session for managing user sessions
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/moddershub' })
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;  // Make 'user' available in views
  next();
});

// Serve static files
app.use(express.static('public'));

// Sample user data (for demonstration purposes)
const users = [
  { username: 'admin', passwordHash: '$2b$10$...' } // Password is hashed
];

// Home route
app.get('/', (req, res) => {
  if (mongoose.connection.readyState !== 1) { // If MongoDB is not connected
    return res.status(500).send('Service is currently unavailable. Please try again later.');
  }
  res.render('index'); // Your homepage
});


// Route for the Mods page
app.get('/mods', isAuthenticated, (req, res) => {
  res.render('mods');
});

// Route for the Resources page
app.get('/resources', isAuthenticated, (req, res) => {
  res.render('resources');
});

// Route for the Tutorials page
app.get('/tutorials', isAuthenticated, (req, res) => {
  res.render('tutorials');
});

// Route for the Login page
app.get('/login', (req, res) => {
  res.render('login', { errorMessage: null }); // Pass null or an empty string when there’s no error
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/sorry', (req, res) => {
  res.render('sorry')
});

app.get('/logedout', isAuthenticated, (req, res) => {
  res.render('logedout')
})

app.get('/account', isAuthenticated, (req, res) => {
  res.render('account')
})
/*
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find the user in the database
  const user = await User.findOne({ username });
  if (!user) {
    return res.render('login', { errorMessage: 'Invalid Username' });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.render('login', { errorMessage: 'Invalid password' });
  }

  // Save the session or authentication token
  req.session.user = { username: user.username };
  res.redirect('/');
});



app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/logedout');
  });
});

app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.render('register', { errorMessage: 'Username already taken' });
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  // Save the new user
  const newUser = new User({ username, passwordHash, email });
  await newUser.save();

  res.redirect('/login');
});
*/

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
