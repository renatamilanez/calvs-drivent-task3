import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function findBookingByUserId(userId: number) {
  return prisma.booking.findMany({
    where: {
      userId: userId
    },
    include: {
      Room: true
    }
  });
}

async function createBooking(booking: BookingData) {
  return prisma.booking.create({
    data: {
      ...booking
    }
  });
}

type BookingData = Omit<Booking, "id" | "createdAt" | "updatedAt">

async function isRoomAvailable(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId
    },
    include: {
      Booking: true
    }
  });
}

async function updateBooking(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId
    },
    data: {
      roomId
    }
  });
}

async function checkReservation(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId: userId
    }
  });
}

const bookingRepository = {
  findBookingByUserId,
  createBooking,
  isRoomAvailable,
  updateBooking,
  checkReservation
};

export default bookingRepository;
