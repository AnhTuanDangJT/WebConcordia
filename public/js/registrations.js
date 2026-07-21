
/*
    Member 4 - Registrations and Upcoming Events
*/
//Student registartion page
//Handles register and cancel buttons

const registerButtons = document.querySelectorAll(".event-card .btn");


registerButtons.forEach(button => {

    button.addEventListener("click", function () {


        // Prevent registering twice

        if (this.dataset.registered === "true") {

            alert("You are already registered for this event.");

            return;

        }


        this.textContent = "Registered";

        this.dataset.registered = "true";


        this.classList.remove("btn-primary");

        this.classList.add("btn-secondary");


    });

});




// Cancel registration functionality

const cancelButtons = document.querySelectorAll(".registration-card .btn");


cancelButtons.forEach(button => {


    button.addEventListener("click", function () {


        const confirmCancel = confirm(
            "Do you want to cancel this registration?"
        );


        if (confirmCancel) {


            this.textContent = "Cancelled";


            this.disabled = true;


        }


    });


});




// Disable unavailable events

const eventStatuses = document.querySelectorAll(".event-card .badge");


eventStatuses.forEach(status => {


    const button = status.parentElement.querySelector("button");


    if (!button) {
        return;
    }


    if (
        status.textContent.includes("Full") ||
        status.textContent.includes("Cancelled") ||
        status.textContent.includes("Completed")
    ) {

        button.disabled = true;

    }


});
// Sort upcoming events by date

// Sort upcoming events by date

const eventList = document.querySelector(".event-list");


if (eventList) {

    const events = Array.from(
        eventList.querySelectorAll(".event-card")
    );


    events.sort((a, b) => {

        return new Date(a.dataset.date) - new Date(b.dataset.date);

    });


    events.forEach(event => {

        eventList.appendChild(event);

    });

}