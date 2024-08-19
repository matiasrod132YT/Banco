// Configuración de Firebase
var firebaseConfig = {
    apiKey: "AIzaSyC5TLM1OyKIq4niSpPDyATK4AdJODZJ7JQ",
    authDomain: "banco-c3084.firebaseapp.com",
    projectId: "banco-c3084",
    storageBucket: "banco-c3084.appspot.com",
    messagingSenderId: "783493786890",
    appId: "1:783493786890:web:1a3231a5e2247d90525ef3",
    measurementId: "G-TRPGS0V74D"
};
// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Mostrar información del usuario en el dashboard
auth.onAuthStateChanged(user => {
    if (user) {
        const userRef = database.ref('users/' + user.uid);
        userRef.once('value').then(snapshot => {
            const userData = snapshot.val();
            document.getElementById('user_name').textContent = userData.full_name;
            document.getElementById('user_balance').textContent = '$' + (userData.balance || 0);

            // Mostrar opciones de admin si es administrador
            if (userData.role === 'admin') {
                document.getElementById('admin_actions').classList.remove('hidden');
            }
        });
    } else {
        window.location.href = 'index.html';
    }
});

// Función para cerrar sesión
function logout() {
    auth.signOut().then(() => {
        Swal.fire('Éxito', 'Sesión cerrada correctamente', 'success')
            .then(() => {
                window.location.href = 'index.html';
            });
    }).catch(error => {
        Swal.fire('Error', error.message, 'error');
    });
}

// Mostrar formulario de transacción
function showTransactionForm(type) {
    document.getElementById('transaction_form').classList.remove('hidden');
    document.getElementById('transaction_form').dataset.type = type;
}

// Procesar transacción (depositar o retirar dinero)
function processTransaction() {
    const amount = parseFloat(document.getElementById('transaction_amount').value);
    if (isNaN(amount) || amount <= 0) {
        Swal.fire('Error', 'Monto no válido', 'error');
        return;
    }

    const user = auth.currentUser;
    const transactionType = document.getElementById('transaction_form').dataset.type;
    const userRef = database.ref('users/' + user.uid);
    userRef.once('value').then(snapshot => {
        const userData = snapshot.val();
        let newBalance = userData.balance || 0;

        if (transactionType === 'deposit') {
            newBalance += amount;
        } else if (transactionType === 'withdraw') {
            if (amount > newBalance) {
                Swal.fire('Error', 'Fondos insuficientes', 'error');
                return;
            }
            newBalance -= amount;
        }

        userRef.update({ balance: newBalance }).then(() => {
            Swal.fire('Éxito', 'Transacción completada', 'success');
            document.getElementById('transaction_form').classList.add('hidden');
            document.getElementById('user_balance').textContent = '$' + newBalance;
        }).catch(error => {
            Swal.fire('Error', error.message, 'error');
        });
    }).catch(error => {
        Swal.fire('Error', error.message, 'error');
    });
}

// Función para solicitar crédito
function requestCredit() {
    const amount = parseFloat(document.getElementById('credit_amount').value);
    const reason = document.getElementById('credit_reason').value;

    if (isNaN(amount) || amount <= 0) {
        Swal.fire('Error', 'Monto no válido', 'error');
        return;
    }
    if (!reason) {
        Swal.fire('Error', 'Motivo es obligatorio', 'error');
        return;
    }

    const user = auth.currentUser;
    const requestRef = database.ref('credit_requests/' + user.uid);
    const newRequestRef = requestRef.push();
    newRequestRef.set({
        amount: amount,
        reason: reason,
        status: 'pending'
    }).then(() => {
        Swal.fire('Éxito', 'Solicitud de crédito enviada', 'success');
    }).catch(error => {
        Swal.fire('Error', error.message, 'error');
    });
}

// Función para ver solicitudes de crédito (solo admin)
function viewCreditRequests() {
    const user = auth.currentUser;
    const userRef = database.ref('users/' + user.uid);

    userRef.once('value').then(snapshot => {
        const userData = snapshot.val();
        if (userData.role === 'admin') {
            const creditRequestsRef = database.ref('credit_requests');
            creditRequestsRef.once('value').then(snapshot => {
                const requests = snapshot.val();
                const listElement = document.getElementById('credit_requests_list');
                listElement.innerHTML = '';

                for (const [userId, requestsData] of Object.entries(requests)) {
                    for (const [requestId, requestData] of Object.entries(requestsData)) {
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <p>Usuario: ${userId}</p>
                            <p>Monto: $${requestData.amount}</p>
                            <p>Motivo: ${requestData.reason}</p>
                            <p>Estado: ${requestData.status}</p>
                            <button onclick="approveCreditRequest('${userId}', '${requestId}')">Aceptar</button>
                            <button onclick="rejectCreditRequest('${userId}', '${requestId}')">Rechazar</button>
                        `;
                        listElement.appendChild(li);
                    }
                }
            }).catch(error => {
                Swal.fire('Error', error.message, 'error');
            });
        } else {
            Swal.fire('Acceso denegado', 'No tienes permiso para ver las solicitudes de crédito', 'error');
        }
    });
}

// Función para aprobar solicitud de crédito
function approveCreditRequest(userId, requestId) {
    const requestRef = database.ref('credit_requests/' + userId + '/' + requestId);
    requestRef.update({ status: 'approved' }).then(() => {
        Swal.fire('Éxito', 'Solicitud de crédito aprobada', 'success');
        viewCreditRequests(); // Refrescar lista
    }).catch(error => {
        Swal.fire('Error', error.message, 'error');
    });
}

// Función para rechazar solicitud de crédito
function rejectCreditRequest(userId, requestId) {
    const requestRef = database.ref('credit_requests/' + userId + '/' + requestId);
    requestRef.update({ status: 'rejected' }).then(() => {
        Swal.fire('Éxito', 'Solicitud de crédito rechazada', 'success');
        viewCreditRequests(); // Refrescar lista
    }).catch(error => {
        Swal.fire('Error', error.message, 'error');
    });
}
