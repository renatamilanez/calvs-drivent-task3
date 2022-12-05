import { prisma } from "@/config";

export async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId
    },
  });
}

export async function createRoom() {
  const hotel = await prisma.hotel.create({
    data: {
      name: "Ibis Santos Dumont",
      image: "https://petindica.com.br/wp-content/uploads/2020/09/ibis-sd-2.jpeg"
    }
  });
  const room = await prisma.room.create({
    data: {
      name: "Quarto 01",
      capacity: 2,
      hotelId: hotel.id,
    }
  });
  return room;
}
