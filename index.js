const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = 3000;

// instanting express
const app= express();
app.use(express.static('public'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    cookie:{maxAge:4000};
    resave: false,
    saveUninitialized: true,
}));

// Sample user data for demonstration
const users = [
    { username: 'Allen', status: 'OK', online: true },
    { username: 'Joseph', status: 'HELP', online: false },
    { username: 'Francis', status: 'EMERGENCY', online: true },
    { username: 'Amina', status: 'OK', online: false },
];

// Sample announcements and messages
const publicAnnouncements = [
    "Public diabates awareness workshop.",
    "New Pharmarcy opening next week.",
    "Masaza cup event this Friday.",
    "A hospotal cleaner is needed.",
    "Health fair next month.",
    "Blood donation on Tuesday.",
    "Got a new Doctor.",
    "Self medication awareness workshop next month.",
    "Free fitness classes starting soon.",
    "Money pox disease around Take care."
];

const publicMessages = [
    "Looking for volunteers for the cleanup!",
    "Anyone interested in joining the sports team?",
    "The library has new books available!",
    "Reminder about the health fair next week.",
    "City council needs community input!",
    "Don't forget about the neighborhood watch meeting!",
    "Fire safety tips are available at the station.",
    "Yoga classes are filling up fast!",
    "Job fair has many opportunities!",
    "Join us for a community picnic!"
];

const privateMessages = [
    "Please login for a meeting.",
    "Meeting rescheduled to next week.",
    "Your application has been approved.",
    "Reminder about your appointment tomorrow.",
    "Feedback needed on the recent project.",
    "Didnot see today.Why?",
    "I need to see you.",
    "Send me your project draft.",
    "Let's discuss your ideas during our call.",
    "See you soon!"
];

// Stop words for filtering search criteria
const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'in'];

// Function to check if search criteria contains only stop words
function containsOnlyStopWords(criteria) {
    const words = criteria.split(' ');
    return words.every(word => stopWords.includes(word.toLowerCase()));
}

// Login route
app.get('/login', (req, res) => {
    res.send(`
        <form method="POST" action="/login">
            <input type="text" name="username" placeholder="Enter username" required>
             <input type="email" name="Email" placeholder="Enter email" required>
            <select name="status" required>
                <option value="">Select Status</option>
                <option value="OK">OK</option>
                <option value="HELP">HELP</option>
                <option value="EMERGENCY">EMERGENCY</option>
            </select>
            <button type="submit">Login</button>
        </form>
    `);
});

// Handle login
app.post('/login', (req, res) => {
    const { username,email, status } = req.body;
    
    // Check if user exists
    const userExists = users.some(user => user.username === username);
    
    if (userExists) {
        // Update user status and store in session
        const userIndex = users.findIndex(user => user.username === username);
        users[userIndex].status = status;
        req.session.username = username;
        req.session.status = status;
        
        res.redirect('/search');
    } else {
        res.send('Invalid username! Please try again.');
    }
});

// Search route
app.get('/search', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/login');
    }
    
    let onlineUsers = users.filter(user => user.online);
    let offlineUsers = users.filter(user => !user.online);
    
    // Sort users alphabetically by username
    onlineUsers.sort((a, b) => a.username.localeCompare(b.username));
    offlineUsers.sort((a, b) => a.username.localeCompare(b.username));
    
    const allUsers = [...onlineUsers, ...offlineUsers];
    
    const userListHtml = allUsers.map(user => `<li>${user.username} - ${user.status}</li>`).join('');
    
    res.send(`
        <h1>Welcome ${req.session.username}</h1>
        <h2>Online Users:</h2>
        <ul>${userListHtml}</ul>
        
        <form method="POST" action="/search">
            <input type="text" name="searchCriteria" placeholder="Search by username" required>
            <button type="submit">Search</button>
        </form>

        <h2>View Announcements:</h2>
        <button onclick="location.href='/announcements'">View Last 10 Public Announcements</button>

        <h2>View Public Messages:</h2>
        <button onclick="location.href='/public-messages'">View Last 10 Public Messages</button>

        <h2>View Private Messages:</h2>
        <button onclick="location.href='/private-messages'">View Last 10 Private Messages</button>

        <form method="POST" action="/stop-search">
            <button type="submit">Stop Searching</button>
        </form>
        
        `);
});

// Handle search
app.post('/search', (req, res) => {
    const { searchCriteria } = req.body;

    // Check if search criteria contains only stop words
    if (containsOnlyStopWords(searchCriteria)) {
        return res.send('<h2>No results found due to stop words!</h2><a href="/search">Try Again</a>');
    }

    const results = users.filter(user => user.username.includes(searchCriteria));

    if (results.length > 0) {
        const resultList = results.map(user => `<li>${user.username} - ${user.status}</li>`).join('');
        res.send(`<h2>Search Results:</h2><ul>${resultList}</ul><a href="/search">Search Again</a>`);
        
     } else {
         res.send('<h2>No results found!</h2><a href="/search">Try Again</a>');
     }
});

// View public announcements route
app.get('/announcements', (req, res) => {
   const announcementsHtml = publicAnnouncements.map(announcement => `<li>${announcement}</li>`).join('');
   res.send(`<h1>Last 10 Public Announcements:</h1><ul>${announcementsHtml}</ul><a href="/search">Back to Search</a>`);
});

// View public messages route
app.get('/public-messages', (req, res) => {
   const messagesHtml = publicMessages.map(message => `<li>${message}</li>`).join('');
   res.send(`<h1>Last 10 Public Messages:</h1><ul>${messagesHtml}</ul><a href="/search">Back to Search</a>`);
});

// View private messages route
app.get('/private-messages', (req, res) => {
   const privateMessagesHtml = privateMessages.map(message => `<li>${message}</li>`).join('');
   res.send(`<h1>Last 10 Private Messages:</h1><ul>${privateMessagesHtml}</ul><a href="/search">Back to Search</a>`);
});

// Stop searching route
app.post('/stop-search', (req, res) => {
   req.session.destroy(err => {
       if (err) return console.log(err);
       res.redirect('/login');
   });
});

// Start server
app.listen(PORT, () => {
   console.log(`Server is running on http://localhost:${PORT}`);
});