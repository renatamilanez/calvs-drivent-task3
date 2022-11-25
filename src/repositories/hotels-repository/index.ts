import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findRoomsByHotelId(hotelId: number) {
  return prisma.room.findMany({
    where: {
      hotelId
    },
    include: {
      Hotel: true
    }
  });
}

async function isHotelIdValid(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId
    }
  });
}

const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
  isHotelIdValid
};

export default hotelRepository;
