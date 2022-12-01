import bookingRepository from "@/repositories/booking-repository";
import { notFoundError } from "@/errors";
import { unauthorizedBooking } from "@/errors/unauthorized-booking-error";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { forbiddenError } from "@/errors/forbidden-error";

async function getBooking(userId: number) {
  const bookings = await bookingRepository.findBookingByUserId(userId);

  if(!bookings) {
    throw notFoundError();
  }

  return bookings;
}

async function checkUserData(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
	
  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw unauthorizedBooking();
  }
}

async function checkRoomInfo(roomId: number) {
  if(roomId < 1) {
    throw notFoundError();
  }

  const roomData = await bookingRepository.isRoomAvailable(roomId);

  if(!roomData) {
    throw notFoundError();
  } if(roomData.Booking.length >= roomData.capacity) {
    throw forbiddenError();
  }
}

async function postBooking(userId: number, roomId: number) {
  await checkUserData(userId);
  await checkRoomInfo(roomId);
	
  const bookingData = {
    userId,
    roomId
  };

  const booking = await bookingRepository.createBooking(bookingData);

  return booking;
}

async function updateBooking(userId: number, roomId: number, bookingId: number) {
  await checkUserData(userId);
  await checkRoomInfo(roomId);

  const reservation = await bookingRepository.checkReservation(userId);
  if(!reservation) {
    throw forbiddenError();
  }
	
  const booking = await bookingRepository.updateBooking(bookingId, roomId);

  if(booking.userId !== userId) {
    throw forbiddenError();
  }

  return booking;
}

const bookingService = {
  getBooking,
  postBooking,
  updateBooking
};

export default bookingService;
