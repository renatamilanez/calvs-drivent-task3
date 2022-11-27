import { prisma } from "@/config";
import { Hotel, Room } from "@prisma/client";

async function findHotels(): Promise<Hotel[]> {
  return prisma.hotel.findMany();
}

async function findRoomsByHotelId(hotelId: number): Promise<(Room & {
	Hotel: Hotel;
})[]> {
  return prisma.room.findMany({
    where: {
      hotelId
    },
    include: {
      Hotel: true
    }
  });
}

async function isHotelIdValid(hotelId: number): Promise<Hotel> {
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
