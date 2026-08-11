
/*
Member 4 - Registrations and Upcoming Events
Handles registration, cancellation, and loading registrations from the API.
*/

// load my registations


async function loadMyRegistrations() {
    const registrationList = document.getElementById("registration-list");

    // This page does not have the registration list
    if (!registrationList) {
        return;
    }

    try {
        const response = await fetch("/api/registrations/my", {
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
            registrationList.innerHTML = `<p>${data.message || "Unable to load registrations."}</p>`;
            return;
        }

        if (data.registrations.length === 0) {
            registrationList.innerHTML = "<p>You have no registrations.</p>";
            return;
        }

        registrationList.innerHTML = "";
const registeredCount = document.getElementById("registered-count");
const attendedCount = document.getElementById("attended-count");
const cancelledCount = document.getElementById("cancelled-count");

if (registeredCount) {
    registeredCount.textContent =
        data.registrations.filter(r => r.status === "Registered").length;
}

if (attendedCount) {
    attendedCount.textContent =
        data.registrations.filter(r => r.attended === "Yes").length;
}

if (cancelledCount) {
    cancelledCount.textContent =
        data.registrations.filter(r => r.status === "Cancelled").length;
}

        data.registrations.forEach(registration => {
            const card = document.createElement("article");
            card.className = "card registration-card";

            card.innerHTML = `
                <h2 class="card-title">
                    ${registration.title}
                </h2>

                <p class="card-text">
                    <strong>Date:</strong> ${registration.event_date}
                </p>

                <p class="card-text">
                    <strong>Location:</strong> ${registration.location}
                </p>

                <span class="badge badge-${registration.status.toLowerCase()}">
                    ${registration.status}
                </span>

                <br><br>

                ${
                    registration.status === "Registered"
                        ? `<button class="btn btn-danger cancel-btn"
                                   data-registration-id="${registration.registration_id}">
                               Cancel Registration
                           </button>`
                        : ""
                }
            `;

            registrationList.appendChild(card);
        });

        setupCancelButtons();

    } catch (error) {
        console.error("Error loading registrations:", error);
        registrationList.innerHTML =
            "<p>Unable to connect to the server.</p>";
    }
}


// Cancelling registration

function setupCancelButtons() {
    const cancelButtons =
        document.querySelectorAll(".cancel-btn");

    cancelButtons.forEach(button => {

        button.addEventListener("click", async function () {

            const registrationId =
                this.dataset.registrationId;

            const confirmCancel = confirm(
                "Do you want to cancel this registration?"
            );

            if (!confirmCancel) {
                return;
            }

            try {

                const response = await fetch(
                    `/api/registrations/${registrationId}/cancel`,
                    {
                        method: "PATCH",
                        credentials: "include"
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    alert(data.message || "Unable to cancel registration.");
                    return;
                }

                alert("Registration cancelled successfully.");

                // Reload the real data from the server
                loadMyRegistrations();

            } catch (error) {
                console.error("Cancellation error:", error);
                alert("Unable to connect to the server.");
            }
        });

    });
}

// How to register for an event


async function registerForEvent(eventId, button) {

    try {

        const response = await fetch("/api/registrations", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                eventId: eventId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to register.");
            return;
        }

        alert("Successfully registered for the event.");

        button.textContent = "Registered";
        button.disabled = true;

    } catch (error) {

        console.error("Registration error:", error);

        alert("Unable to connect to the server.");
    }
}

// Starting Point

document.addEventListener("DOMContentLoaded", () => {

    loadMyRegistrations();
    loadUpcomingEvents();

});
const registerEventButton =
    document.getElementById("register-event-btn");

if (registerEventButton) {
    registerEventButton.addEventListener("click", async () => {

        const eventId = registerEventButton.dataset.eventId;

        try {
            const response = await fetch("/api/registrations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    eventId: Number(eventId)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to register.");
                return;
            }

            alert("Successfully registered for the event.");

            registerEventButton.textContent = "Registered";
            registerEventButton.disabled = true;

        } catch (error) {
            console.error("Registration error:", error);
            alert("Unable to connect to the server.");
        }
    });
}
// Load upcoming events from the database
async function loadUpcomingEvents() { const eventList = document.getElementById("upcoming-events-list"); if (!eventList) { return; } try { const response = await fetch("/api/public/upcoming-events"); const data = await response.json(); if (!response.ok || !data.success) { eventList.innerHTML = "<p>Unable to load upcoming events.</p>"; return; } if (data.events.length === 0) { eventList.innerHTML = "<p>No upcoming events available.</p>"; return; } eventList.innerHTML = ""; data.events.forEach(event => { const card = document.createElement("article"); card.className = "card event-card"; let buttonHTML = ""; if (event.status === "Open") { buttonHTML = ` <button class="btn btn-primary upcoming-register-btn" data-event-id="${event.event_id}"> Register </button> `; } else if (event.status === "Full") { buttonHTML = ` <button class="btn btn-primary" disabled> Registration Full </button> `; } else { buttonHTML = ` <button class="btn btn-primary" disabled> ${event.status} </button> `; } card.innerHTML = ` <h2 class="card-title"> ${event.title} </h2> <p class="card-text"> <strong>Date:</strong> ${event.event_date} </p> <p class="card-text"> <strong>Location:</strong> ${event.location} </p> <span class="badge badge-${event.status.toLowerCase()}"> ${event.status} </span> <br><br> ${buttonHTML} `; eventList.appendChild(card); }); document.querySelectorAll(".upcoming-register-btn").forEach(button => { button.addEventListener("click", async () => { const eventId = Number(button.dataset.eventId); try { const response = await fetch("/api/registrations", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ eventId: eventId }) }); const data = await response.json(); if (!response.ok) { alert(data.message || "Unable to register."); return; } alert("Successfully registered for the event."); button.textContent = "Registered"; button.disabled = true; } catch (error) { console.error("Registration error:", error); alert("Unable to connect to the server."); } }); }); } catch (error) { console.error("Error loading upcoming events:", error); eventList.innerHTML = "<p>Unable to connect to the server.</p>"; } }
