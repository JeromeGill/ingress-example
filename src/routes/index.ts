import { routes as SubmitUrlRoutes } from "./submit-url";
import { TRoute } from "@/types";
import { Application } from "express";

const routes: TRoute[] = [...SubmitUrlRoutes];

export const registerRoutes = (app: Application) => {
  routes.forEach((route) => {
    app.use(route.path, route.method);
  });
};
