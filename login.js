    // LOGIN
    function submitForm() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Perform client-side validation
        if (username && password) {
            // For a real application, you would make an AJAX request to the server here
            // and handle the response accordingly. For simplicity, we'll just display a message.
            const loginMessage = document.getElementById('loginMessage');
            loginMessage.textContent = `Logged in as ${username}`;
            loginMessage.style.color = 'green';
        } else {
            const loginMessage = document.getElementById('loginMessage');
            loginMessage.textContent = 'Please enter both username and password.';
            loginMessage.style.color = 'red';
        }
    };
