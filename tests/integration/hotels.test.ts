import supertest from "supertest";
import app, { init } from "@/app";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import * as jwt from "jsonwebtoken";
import {
  createUser,
  createTicket,
  createEnrollmentWithAddress,
  createTicketType
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";
import { prisma } from "@/config";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 if tickek is remote, doesn't include an hotel or hotel is unpaid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, false);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.RESERVED);

      const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
			
      expect(result.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should respond with empty array when there are no hotel created", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.body).toEqual([]);
    });

    it("should respond with status 200 and with existing Hotel data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      await prisma.hotel.create({
        data: {
          name: "Ibis Santos Dumont",
          image: "https://petindica.com.br/wp-content/uploads/2020/09/ibis-sd-2.jpeg"
        }
      });

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ])
      );
    });
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 if tickek is remote, doesn't include an hotel or hotel is unpaid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, false);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.RESERVED);

      const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
			
      expect(result.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 404 when hotelId does not exist", async () => {
      const token = await generateValidToken();

      const result = await server.get("/hotels/0").set("Authorization", `Bearer ${token}`);
      expect(result.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and with rooms data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await prisma.hotel.create({
        data: {
          name: "Ibis Santos Dumont",
          image: "https://petindica.com.br/wp-content/uploads/2020/09/ibis-sd-2.jpeg"
        }
      });
      await prisma.room.create({
        data: {
          name: "Quarto 01",
          capacity: 2,
          hotelId: hotel.id,
        }
      });

      const result = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(result.status).toEqual(httpStatus.OK);
      expect(result.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            capacity: expect.any(Number),
            Hotel: {
              id: expect.any(Number),
              name: expect.any(String),
              image: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String)
            },
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ])
      );
    });
  });
});
