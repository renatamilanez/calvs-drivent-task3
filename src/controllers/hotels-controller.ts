import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotels-service";
import { Response } from "express"; 
import httpStatus from "http-status";
import { Hotel, Room } from "@prisma/client";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    await hotelService.isHotelPaid(userId);

    const hotels: Hotel[] = await hotelService.getHotels();

    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    if(error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    } else if (error.name === "UnauthorizerError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    } else if (error.name === "BadRequestError") {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    } else {
      return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export async function getHotelByID(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotelId = Number(req.params.hotelId);

  try {
    await hotelService.isHotelIdValid(hotelId);
    await hotelService.isHotelPaid(userId);

    const rooms: (Room & {
			Hotel: Hotel;
		})[] = await hotelService.getRoomsByHotelId(hotelId);
		
    return res.status(httpStatus.OK).send(rooms);
  } catch (error) {
    if(error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    } else if (error.name === "UnauthorizerError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    } else if (error.name === "BadRequestError") {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    } else {
      return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
