let adminLogin = false;

document.addEventListener("DOMContentLoaded", () => {
    const studentRole = document.querySelector(".student");
    const adminRole = document.querySelector(".admin");
    const roleSlider = document.getElementById("submit-role");
    const submitButton = document.getElementById("submit-button");
    const redirect = document.querySelector(".redirect");

    // Role slider
    roleSlider.addEventListener("change", (event) =>
    {
        adminLogin = !adminLogin;
        if(event.target.checked)
        {
            redirect?.classList.add("isAdmin");
            submitButton.classList.add("isAdmin");
            studentRole.classList.remove("enabled");
            adminRole.classList.add("enabled");
        }
        else
        {
            redirect?.classList.remove("isAdmin");
            submitButton.classList.remove("isAdmin");
            studentRole.classList.add("enabled");
            adminRole.classList.remove("enabled");
        }
    });

    // login form validation
    const loginForm = document.getElementById("login-form");
    if(loginForm)
    {
        loginForm.addEventListener("submit", (event) => 
        {
            event.preventDefault();

            const authMessage = document.getElementById("auth-form-message");
            const loginEmail = document.getElementById("login-email");
            const loginPassword = document.getElementById("login-password");

            const fieldsAreComplete =
                loginEmail.value.trim() !== "" &&
                loginPassword.value.trim() !== "";
            const emailIsValid = loginEmail.checkValidity();

            authMessage.classList.remove("error");
            
            if (!fieldsAreComplete) {
            authMessage.textContent =
                "Please complete all fields.";

            authMessage.classList.add("error");
            return;
            }

            else if (!emailIsValid) {
                authMessage.textContent =
                    "Please enter a valid email address.";

                authMessage.classList.add("error");
                return;
            }

            else
            {
                authMessage.textContent = "";
                window.location.href = adminLogin ? "../views/admin-dashboard.html" : "../views/student-dashboard.html"
            }

        });
    }

    // registration form validation
    const registerForm = document.getElementById("register-form");
    if(registerForm)
    {
        registerForm.addEventListener("submit", (event) => 
        {
            event.preventDefault();

            const authMessage = document.getElementById("auth-form-message");
            const registerName = document.getElementById("register-name");
            const registerEmail = document.getElementById("register-email");
            const registerPassword = document.getElementById("register-password");
            const registerConfirmPassword = document.getElementById("register-confirm-password");

            const fieldsAreComplete =
                registerName.value.trim() !== "" &&
                registerEmail.value.trim() !== "" &&             
                registerPassword.value.trim() !== "" &&
                registerConfirmPassword.value.trim() !== "";

            const emailIsValid = registerEmail.checkValidity();
            const passwordLengthSufficient = registerPassword.value.length >= 8;
            const passwordConfirmed = registerPassword.value == registerConfirmPassword.value;

            authMessage.classList.remove("error");
            
            if (!fieldsAreComplete) {
            authMessage.textContent =
                "Please complete all fields.";

            authMessage.classList.add("error");
            return;
            }

            else if (!passwordLengthSufficient)
            {
                authMessage.textContent =
                    "Passwords is too short.";

                authMessage.classList.add("error");
                return;
            }

            else if (!passwordConfirmed) {
                authMessage.textContent =
                    "Passwords do not match.";

                authMessage.classList.add("error");
                return;
            }

            else if (!emailIsValid) {
                authMessage.textContent =
                    "Please enter a valid email address.";

                authMessage.classList.add("error");
                return;
            }

            else
            {
                authMessage.textContent = "";
                window.location.href = "../views/login.html";
            }

        });
    }

});