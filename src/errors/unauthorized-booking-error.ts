import { ApplicationError } from "@/protocols";

export function unauthorizedBooking(): ApplicationError {
  return {
    name: "UnauthorizedBooking",
    message: "Can not make a reservation!",
  };
}
