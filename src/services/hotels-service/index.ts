import { notFoundError, unauthorizedError } from "@/errors";
import { badRequestError } from "@/errors/bad-request-error";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotels-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { TicketStatus } from "@prisma/client";

async function getHotels() {
  const hotels = await hotelRepository.findHotels();
  if(!hotels) throw notFoundError();

  return hotels;
}

async function getRoomsByHotelId(hotelId: number) {
  const rooms = await hotelRepository.findRoomsByHotelId(hotelId);
  if(!rooms) throw notFoundError();

  return rooms;
}

async function isHotelIdValid(hotelId: number) {
  const hotel = await hotelRepository.isHotelIdValid(hotelId);
  if(!hotel) throw notFoundError();
	
  return hotel;
}

async function isHotelPaid(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw unauthorizedError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) {
    throw badRequestError();
  } if (ticket.TicketType.isRemote !== false) {
    throw badRequestError();
  } if (ticket.TicketType.includesHotel !== true) {
    throw badRequestError();
  } if (ticket.status === TicketStatus.RESERVED) {
    throw badRequestError();
  }

  return ticket;
}

const hotelService = {
  getHotels,
  getRoomsByHotelId,
  isHotelPaid,
  isHotelIdValid
};

export default hotelService;
