let adminLogin = false;

const toggleclass = (element, iClass) => 
{ 
    let has = element.classList.contains(iClass);
    if(has)
        element.classList.remove(iClass);
    else
        element.classList.add(iClass);
};

async function receiveResponse(response, context, authMessage, setError)
{
    if (!response.ok) 
    {
        const data = await response.json();
        const errorMessage =
            data.errors?.[0]?.msg ||
            data.message ||
            "Unable to " + context + ".";

        authMessage.textContent = errorMessage;
        if(setError)
            authMessage.classList.add("error");
        return false;
    }
    return true;
}

async function send(url, useMethod, arguments)
{
    return fetch(url, 
    {
        method: useMethod,
        headers: 
        {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(arguments),
    });
}

document.addEventListener("DOMContentLoaded", async () => {

    const studentRole = document.querySelector(".student");
    const adminRole = document.querySelector(".admin");
    const roleSlider = document.getElementById("submit-role");
    const submitButton = document.getElementById("submit-button");
    const redirect = document.querySelector(".redirect");

    // Role slider
    if(roleSlider)
    {
        roleSlider.addEventListener("change", (event) =>
        {
            adminLogin = !adminLogin;
            if(redirect !== null)
                toggleclass(redirect, "isAdmin");
            toggleclass(submitButton, "isAdmin");
            toggleclass(studentRole, "enabled");
            toggleclass(adminRole, "enabled");
        });
    }

    // login form
    const loginForm = document.getElementById("login-form");
    if(loginForm)
    {
        const authMessage = document.getElementById("auth-form-message");
        const loginEmail = document.getElementById("login-email");
        const loginPassword = document.getElementById("login-password");

        loginForm.addEventListener("submit", async (event) => 
        {
            event.preventDefault();

            authMessage.classList.remove("error");

            try 
            {
                const response = await send("/api/auth/login", "POST",                         
                    {
                            email: loginEmail.value.trim(),
                            password: loginPassword.value,
                            role: roleSlider.checked ? "admin" : "student"
                    });


                const check = await receiveResponse(response, "log in", authMessage, true);
                if(check)
                {
                    if(response.redirected)
                        window.location.href = response.url;
                }
            } 
            catch (error) 
            {
                authMessage.textContent =
                    "Network error. Please try again later.";
                authMessage.classList.add("error");
            }
        });
    }

    // registration form
    const registerForm = document.getElementById("register-form");
    if(registerForm)
    {
        const authMessage = document.getElementById("auth-form-message");
        const registerName = document.getElementById("register-name");
        const registerEmail = document.getElementById("register-email");
        const registerPassword = document.getElementById("register-password");
        const registerConfirmPassword = document.getElementById("register-confirm-password");

        registerForm.addEventListener("submit", async (event) => 
        {
            event.preventDefault();

            authMessage.classList.remove("error");

           try 
            {
                const response = await send("/api/auth/register", "POST",                         
                    {
                        full_name: registerName.value.trim(),
                        email: registerEmail.value.trim(),
                        password: registerPassword.value,
                        confirmpassword: registerConfirmPassword.value,
                        role: roleSlider.checked ? "admin" : "student"
                    });

                const check = await receiveResponse(response, "register", authMessage, true);
                if(check)
                {
                    authMessage.textContent = "Registration successful";
                    authMessage.classList.add("success");
                    submitButton.disabled = true;
                    if(response.redirected)
                        setTimeout(() => { window.location.href = response.url; }, 1000);
                }
            } 
            catch (error) 
            {
                authMessage.textContent =
                    "Network error. Please try again later.";
                authMessage.classList.add("error");
            }
        });
    }

    // Profile forms
    const profileContent = document.querySelector(".profile-content");
    if(profileContent)
    {
        try 
        {
            // Display current profile information
            const response = await fetch("/api/auth/me");
            const json = await response.json();
            const user = json.data;

            profileContent.innerHTML = `
            <span class="section-label section-label-light">
                    Welcome back,
                </span>
                <h1>${user.full_name}</h1>
                <p>
                    These are your profile details:
                </p>
                <ul>
                    <li>Email: ${user.email}</li>
                    <li>User ID: ${user.user_id}</li>
                    <li>Date of registration: ${new Date(user.created_at).toLocaleDateString()}</span></li>
                    <li>Role: ${user.role}</li>
                </ul>
                `
            
            const detailsForm = document.getElementById("details-form");
            const passwordForm = document.getElementById("password-form");

            // password form
            if(passwordForm)
            {
                const profilePasswordMessage = document.querySelector(".profile-password-message");
                const profilePassword = document.getElementById("profile-password");
                const profileConfirmPassword = document.getElementById("profile-confirm-password");
                const submitDetailsbutton = document.getElementById("password-submit-button");

                passwordForm.addEventListener("submit", async (event) => 
                {
                    event.preventDefault();
                                    
                    const hasPasswordValue = profilePassword.value.length > 0 && profileConfirmPassword.value.length > 0;

                    if(hasPasswordValue)
                    {
                        try 
                        {
                            const response = await send("/api/auth/password", "PUT", 
                                    {
                                        password: profilePassword.value,
                                        confirmpassword: profileConfirmPassword.value,
                                    }
                            );

                            const check = await receiveResponse(response, "change password", profilePasswordMessage);
                            if(check)
                            {
                                console.log("hhhh");
                                profilePasswordMessage.textContent = "Password changed successfully";
                                submitDetailsbutton.disabled = true;
                                setTimeout(() => { window.location.href = "/api/auth/profile"; }, 1000);
                            }
                        } 
                        catch (error) 
                        {
                            profilePasswordMessage.textContent =
                                "Network error. Please try again later.";
                        }
                    }
                });


            }
            if(detailsForm)
            {
                const profileDetailsMessage = document.querySelector(".profile-details-message");
                const profileName = document.getElementById("profile-name");
                const profileEmail = document.getElementById("profile-email");
                const submitPasswordbutton = document.getElementById("details-submit-button");

                detailsForm.addEventListener("submit", async (event) => 
                {
                    event.preventDefault();

                    const hasNameValue = profileName.value.length > 0;
                    const hasEmailValue = profileEmail.value.length > 0;


                    if(hasNameValue || hasEmailValue)
                    {
                        let useName = hasNameValue ? profileName.value : user.full_name;
                        let useEmail = hasEmailValue ? profileEmail.value : user.email;
                        try 
                        {
                            const response = await send("/api/auth/profile", "PUT", 
                                    {
                                        full_name: useName.trim(),
                                        email: useEmail.trim(),
                                    }
                            );

                            const check = await receiveResponse(response, "change details", profileDetailsMessage);
                            if(check)
                            {
                                profileDetailsMessage.textContent = "Details changed successfully";
                                submitPasswordbutton.disabled = true;
                                setTimeout(() => { window.location.href = "/api/auth/profile"; }, 1000);
                            }
                        } 
                        catch (error) 
                        {
                            profileDetailsMessage.textContent =
                                "Network error. Please try again later.";
                            profileDetailsMessage.classList.add("error");
                        }
                    }

                }); 
            }
        }
        catch (error) 
        {
            console.log(error);
            profileContent.innerHTML = "<h1>An error occured while attempting to retrieve your profile information.</h1>";
        }
    }
});