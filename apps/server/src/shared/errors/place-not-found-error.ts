export class PlaceNotFoundError extends Error {
  constructor() {
    super("Place not found");
  }
}
