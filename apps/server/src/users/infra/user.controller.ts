import { FavoritePlacesNotFoundError } from "@/shared/errors/favorite-places-not-found.error";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { authMiddleware } from "@/shared/infra/auth.middleware";
import { repositories } from "@/shared/singleton/repositories";
import Elysia from "elysia";
import { userFavoritePlacesUsecase } from "../application/user-favorite-places.usecase";

export const UserController = new Elysia({
    prefix: "/users",
    tags: ["Users"],
})
    .use(authMiddleware)
    .get(
        "/favorite-places",
        async ({ validateToken, set }) => {
            try {
                const user = await validateToken();

                if (!user) {
                    throw new UnauthorizedError();
                }

                const response = await userFavoritePlacesUsecase(
                    user.id,
                    repositories.favoritePlaceRepository,
                );

                set.status = 200;
                return {
                    status: "sucess",
                    message: "get user's favorite places",
                    response,
                };
            } catch (error) {
                if (error instanceof UnauthorizedError) {
                    set.status = 401;
                    return {
                        status: "error",
                        message: error.message,
                    };
                }

                if (error instanceof FavoritePlacesNotFoundError) {
                    set.status = 404;
                    return {
                        status: "error",
                        message: error.message,
                    };
                }

                set.status = 500;
                console.error(error);
                return {
                    status: "error",
                    error: "Internal Server Error",
                };
            }
        },
        {
            detail: {
                tags: ["Users"],
                summary: "Get all user's favorite places",
                description: "Get all user's favorite places",
            },
        },
    )
    .get('/can-send-email', async ({ validateToken, set }) => {
        try {
            const user = await validateToken();

            if (!user) {
                throw new UnauthorizedError();
            }

            const response = await repositories.userRepository.getUsersToSendEmail();

            set.status = 200;
            return {
                status: "sucess",
                message: "get users to send email",
                response,
            };
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                set.status = 401;
                return {
                    status: "error",
                    message: error.message,
                };
            }

            set.status = 500;
            console.error(error);
            return {
                status: "error",
                error: "Internal Server Error",
            };
        }
    },
        {
            detail: {
                tags: ["Users"],
                summary: "Get all users to send email",
                description: "Get all users to send email",
            },
        });
