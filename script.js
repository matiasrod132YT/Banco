// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyC5TLM1OyKIq4niSpPDyATK4AdJODZJ7JQ",
    authDomain: "banco-c3084.firebaseapp.com",
    projectId: "banco-c3084",
    storageBucket: "banco-c3084.appspot.com",
    messagingSenderId: "783493786890",
    appId: "1:783493786890:web:1a3231a5e2247d90525ef3",
    measurementId: "G-TRPGS0V74D"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Initialize variables
const auth = firebase.auth()
const database = firebase.database()

// Set up our register function
function register() {
    // Get all our input fields
    const email = document.getElementById('register_email').value;
    const password = document.getElementById('register_password').value;
    const fullName = document.getElementById('register_full_name').value;

    // Validate input fields
    if (!validateEmail(email) || !validatePassword(password)) {
        Swal.fire('Error', 'Email o Contraseña no válidos', 'error');
        return;
    }
    if (!validateField(fullName)) {
        Swal.fire('Error', 'El nombre completo es obligatorio', 'error');
        return;
    }

    // Move on with Auth
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            // Declare user variable
            const user = auth.currentUser;

            // Add this user to Firebase Database
            const databaseRef = database.ref();

            // Create User data
            const userData = {
                email: email,
                full_name: fullName,
                last_login: Date.now(),
                balance: 0 // Initialize balance
            };

            // Push to Firebase Database
            databaseRef.child('users/' + user.uid).set(userData);

            // Done
            Swal.fire('Success', 'Usuario creado correctamente', 'success');
            document.getElementById('login_form').style.display = 'block';
            document.getElementById('register_form').style.display = 'none';
        })
        .catch(error => {
            // Firebase will use this to alert of its errors
            Swal.fire('Error', error.message, 'error');
        });
}

// Set up our login function
function login() {
    // Get all our input fields
    const email = document.getElementById('login_email').value;
    const password = document.getElementById('login_password').value;

    // Validate input fields
    if (!validateEmail(email) || !validatePassword(password)) {
        Swal.fire('Error', 'Email o Contraseña no válidos', 'error');
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            // Done
            Swal.fire('Success', 'Usuario logueado correctamente', 'success')
                .then(() => {
                    window.location.href = 'dashboard.html';
                });
        })
        .catch(error => {
            // Firebase will use this to alert of its errors
            Swal.fire('Error', error.message, 'error');
        });
}

// Validate Functions
function validateEmail(email) {
    const expression = /^[^@]+@\w+(\.\w+)+\w$/;
    return expression.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateField(field) {
    return field && field.length > 0;
}

function toggleForm() {
    const loginForm = document.getElementById('login_form');
    const registerForm = document.getElementById('register_form');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}
