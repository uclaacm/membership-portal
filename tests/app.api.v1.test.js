import server from "..";
import request from "supertest"

console.error = jest.fn()

beforeAll(async () => {
  await request(server).get('/app/api/v1/health')
});

afterAll(() => {
  server.close();
});

describe("Health Test", () => {

  const healthResponsePromise = request(server).get('/app/api/v1/health');

  it("Should respond with status code 200", async () => {
    const response = await healthResponsePromise;
    return expect(response.statusCode).toBe(200);
  });

  it("Should have CPU key", async () => {
    const response = await healthResponsePromise;
    return expect(response.body).toHaveProperty("cpu");
  });

  it("Should have Memory key", async () => {
    const response = await healthResponsePromise;
    return expect(response.body).toHaveProperty("memory");
  });

  it("Should have Uptime key", async () => {
    const response = await healthResponsePromise;
    return expect(response.body).toHaveProperty("uptime");
  });

});