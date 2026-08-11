const request = require('supertest');
const app = require('../app');

describe('Events API', () => {

    // ----------------------------------------------------
    // GET ALL EVENTS
    // ----------------------------------------------------
    describe('GET /api/events', () => {

        test('should return a list of events', async () => {
            const response = await request(app)
                .get('/api/events');

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');

            expect(Array.isArray(response.body.data)).toBe(true);
        });


        test('events should include registration count and remaining seats', async () => {
            const response = await request(app)
                .get('/api/events');

            expect(response.statusCode).toBe(200);

            if (response.body.data.length > 0) {
                const event = response.body.data[0];

                expect(event).toHaveProperty('registration_count');
                expect(event).toHaveProperty('remaining_seats');
            }
        });

    });


    // ----------------------------------------------------
    // FILTER EVENTS
    // ----------------------------------------------------
    describe('GET /api/events with filters', () => {

        test('should filter events by category', async () => {

            // First get an existing event
            const allEventsResponse = await request(app)
                .get('/api/events');

            expect(allEventsResponse.statusCode).toBe(200);

            if (allEventsResponse.body.data.length === 0) {
                return;
            }

            const category =
                allEventsResponse.body.data[0].category;

            const response = await request(app)
                .get('/api/events')
                .query({ category });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);

            response.body.data.forEach((event) => {
                expect(event.category).toBe(category);
            });
        });


        test('should filter events by location', async () => {

            const allEventsResponse = await request(app)
                .get('/api/events');

            expect(allEventsResponse.statusCode).toBe(200);

            if (allEventsResponse.body.data.length === 0) {
                return;
            }

            const location =
                allEventsResponse.body.data[0].location;

            const response = await request(app)
                .get('/api/events')
                .query({ location });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);

            response.body.data.forEach((event) => {
                expect(event.location).toBe(location);
            });
        });


        test('should filter events by status', async () => {

            const allEventsResponse = await request(app)
                .get('/api/events');

            expect(allEventsResponse.statusCode).toBe(200);

            if (allEventsResponse.body.data.length === 0) {
                return;
            }

            const status =
                allEventsResponse.body.data[0].status;

            const response = await request(app)
                .get('/api/events')
                .query({ status });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);

            response.body.data.forEach((event) => {
                expect(event.status).toBe(status);
            });
        });

    });


    // ----------------------------------------------------
    // EVENT DETAILS
    // ----------------------------------------------------
    describe('GET /api/events/details/:eventId', () => {

        test('should return details for an existing event', async () => {

            // Get an existing event ID first
            const allEventsResponse = await request(app)
                .get('/api/events');

            expect(allEventsResponse.statusCode).toBe(200);

            if (allEventsResponse.body.data.length === 0) {
                return;
            }

            const eventId =
                allEventsResponse.body.data[0].event_id;

            const response = await request(app)
                .get(`/api/events/details/${eventId}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('data');

            const event = response.body.data;

            expect(event).toHaveProperty('event_id');
            expect(event).toHaveProperty('title');
            expect(event).toHaveProperty('description');
            expect(event).toHaveProperty('category');
            expect(event).toHaveProperty('event_date');
            expect(event).toHaveProperty('start_time');
            expect(event).toHaveProperty('end_time');
            expect(event).toHaveProperty('location');
            expect(event).toHaveProperty('capacity');
            expect(event).toHaveProperty('status');
            expect(event).toHaveProperty('organizer_name');

            expect(event).toHaveProperty('registration_count');
            expect(event).toHaveProperty('remaining_seats');
        });


        test('should return 404 when event does not exist', async () => {

            const response = await request(app)
                .get('/api/events/details/99999999');

            expect(response.statusCode).toBe(404);

            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty('message');
        });


        test('should return 400 when event ID is missing', async () => {

            const response = await request(app)
                .get('/api/events/details');

            expect(response.statusCode).toBe(400);

            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty('message');
        });

    });


    // ----------------------------------------------------
    // FILTER OPTIONS
    // ----------------------------------------------------
    describe('GET /api/events/filter-options', () => {

        test('should return event filter options from the database', async () => {

            const response = await request(app)
                .get('/api/events/filter-options');

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('data');
        });

    });


    // ----------------------------------------------------
    // SELECT EVENT FOR DETAILS
    // ----------------------------------------------------
    describe('POST /api/events/select', () => {

        test('should accept a valid event ID', async () => {

            const response = await request(app)
                .post('/api/events/select')
                .send({
                    event_id: 1
                });

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);
            expect(response.body.event_id).toBe('1');
        });


        test('should reject request when event ID is missing', async () => {

            const response = await request(app)
                .post('/api/events/select')
                .send({});

            expect(response.statusCode).toBe(400);

            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty('message');
        });

    });

});