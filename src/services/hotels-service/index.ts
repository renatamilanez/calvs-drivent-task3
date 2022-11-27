import { notFoundError, unauthorizedError } from "@/errors";
import { badRequestError } from "@/errors/bad-request-error";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotels-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { 
  Ticket, 
  TicketType, 
  TicketStatus, 
  Room, 
  Hotel, 
  Enrollment, 
  Address } from "@prisma/client";

async function getHotels(): Promise<Hotel[]> {
  const hotels: Hotel[] = await hotelRepository.findHotels();
  if(!hotels) throw notFoundError();

  return hotels;
}

async function getRoomsByHotelId(hotelId: number): Promise<(Room & {
	Hotel: Hotel;
})[]> {
  const rooms: (Room & {
  Hotel: Hotel;
	})[] = await hotelRepository.findRoomsByHotelId(hotelId);
  if(!rooms) throw notFoundError();

  return rooms;
}

async function isHotelIdValid(hotelId: number): Promise<Hotel> {
  const hotel: Hotel = await hotelRepository.isHotelIdValid(hotelId);
  if(!hotel) throw notFoundError();
	
  return hotel;
}

async function isHotelPaid(userId: number): Promise<Ticket & {
	TicketType: TicketType;
}> {
  const enrollment: Enrollment & {
    Address: Address[];
} = await enrollmentRepository.findWithAddressByUserId(userId);
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
