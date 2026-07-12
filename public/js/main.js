document.addEventListener("DOMContentLoaded", () => {
    const navToggle = document.querySelector(".nav-toggle");
    const navigation = document.querySelector(".primary-navigation");
    const navigationLinks = document.querySelectorAll(".nav-links a");

    // Some pages may not contain the navigation menu.
    if (!navToggle || !navigation) {
        return;
    }

    function closeMenu() {
        navigation.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.textContent = "☰";
    }

    navToggle.addEventListener("click", () => {
        const menuIsOpen = navigation.classList.toggle("is-open");

        navToggle.setAttribute("aria-expanded", String(menuIsOpen));
        navToggle.textContent = menuIsOpen ? "✕" : "☰";
    });

    navigationLinks.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });
    const contactForm = document.querySelector("#contact-form");
    
const contactFormMessage = document.querySelector(
    "#contact-form-message"
);

if (contactForm && contactFormMessage) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const nameInput = document.querySelector("#contact-name");
        const emailInput = document.querySelector("#contact-email");
        const subjectInput = document.querySelector("#contact-subject");
        const messageInput = document.querySelector("#contact-message");

        const fieldsAreComplete =
            nameInput.value.trim() !== "" &&
            emailInput.value.trim() !== "" &&
            subjectInput.value.trim() !== "" &&
            messageInput.value.trim() !== "";

        const emailIsValid = emailInput.checkValidity();

        contactFormMessage.classList.remove("error", "success");

        if (!fieldsAreComplete) {
            contactFormMessage.textContent =
                "Please complete all required fields.";

            contactFormMessage.classList.add("error");
            return;
        }

        if (!emailIsValid) {
            contactFormMessage.textContent =
                "Please enter a valid email address.";

            contactFormMessage.classList.add("error");
            return;
        }

        contactFormMessage.textContent =
            "Your message has been submitted successfully.";

        contactFormMessage.classList.add("success");
        contactForm.reset();
    });
}
});